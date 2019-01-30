/* global d3 */
import * as topojson from "topojson";
import {select} from "../js/utils/dom.js";
import "intersection-observer";
import scrollama from "scrollama";
import { legendColor } from "d3-svg-legend";
import { toCircle, fromCircle } from "flubber";


function resize() {}

function init() {
	let width = select(".mapcontainer").clientWidth;
	let height = select(".mapcontainer").clientHeight;
	let mapOne = d3.select("svg#mapone")
		.attr("width", width)
		.attr("height", height);

	let projection = d3.geoAzimuthalEqualArea()
		.rotate([-10,-52,0]);

	let path = d3.geoPath()
		.projection(projection);
	
	//d3.json("assets/data/NUTS_RG_20M_2013_4326_LEVL_2.json", function(nuts2) {
	d3.json("assets/data/NUTS2_20M_2013_topo.json", function(nuts2) {
		d3.json("assets/data/NUTS_RG_20M_2013_4326_LEVL_0.json", function(nuts0) {
			d3.json("assets/data/land.json", function(land) {
				d3.json("assets/data/capitals.json", function(capitals) {
					d3.csv('assets/data/regiondata.csv', function(regiondata){

						regiondata.forEach(function(el){
							el.gdppps16 = +el.gdppps16;
						});
						
						let countrydata = regiondata.filter((d) => d.type == "country");
						countrydata.sort(function(x, y){
							return d3.descending(x.gdppps16, y.gdppps16);
						});

						/* Scrollama */
						const scroller = scrollama();
						scroller.setup({
							step: ".step"
						})
						.onStepEnter(handleStepEnter);

						function handleStepEnter(step){
							d3.selectAll(".step").classed("is-active", false);
							d3.select(step.element).classed("is-active", true);

							if(step.index == 2 && step.direction == "down"){
								countries.style("fill-opacity", 0);

								histogrammifyLegend(getRegionFrequencies("gdppps16", devscale.domain()), devscale.range());
							}
							if(step.index == 1 && step.direction == "up"){
								countries.style("fill-opacity", 1);
								
								let countrycounts = [7, 7, 6, 4, 4];
								histogrammifyLegend(countrycounts, devscale.range())
							}

							if(step.index == 5 && step.direction == "down"){
								regions.style("fill", (d) => absfundScale(d.properties.totalpayments0716))
								
								histogrammifyLegend(getRegionFrequencies("totalpayments0716", absfundScale.domain()), absfundScale.range());
							}
							if(step.index == 4 && step.direction == "up"){
								regions.style("fill", (d) => devscale(d.properties.gdppps16))

								histogrammifyLegend(getRegionFrequencies("gdppps16", devscale.domain()), devscale.range());
							}
							
							if(step.index == 6 && step.direction == "down"){
								regions.style("fill", (d) => percapitafundScale(d.properties.totalpercapita0716))

								histogrammifyLegend(getRegionFrequencies("totalpercapita0716", percapitafundScale.domain()), absfundScale.range());
							}
							if(step.index == 5 && step.direction == "up"){
								regions.style("fill", (d) => absfundScale(d.properties.totalpayments0716))

								histogrammifyLegend(getRegionFrequencies("totalpayments0716", absfundScale.domain()), absfundScale.range());
							}

							if(step.index == 7 && step.direction == "down"){
								regions.style("fill", (d) => fundpercgdpScale(d.properties.fundpercgdp15))

								histogrammifyLegend(getRegionFrequencies("fundpercgdp15", fundpercgdpScale.domain()), absfundScale.range());
							}
							if(step.index == 6 && step.direction == "up"){
								regions.style("fill", (d) => percapitafundScale(d.properties.totalpercapita0716))
								
								histogrammifyLegend(getRegionFrequencies("totalpercapita0716", percapitafundScale.domain()), absfundScale.range());
							}

							if(step.index == 8 && step.direction == "down"){
								regions.style("fill", (d) => devscale(d.properties.gdppps16))
								
								histogrammifyLegend(getRegionFrequencies("gdppps16", devscale.domain()), devscale.range());
							}
							if(step.index == 7 && step.direction == "up"){
								regions.style("fill", (d) => fundpercgdpScale(d.properties.fundpercgdp15))

								histogrammifyLegend(getRegionFrequencies("fundpercgdp15", fundpercgdpScale.domain()), absfundScale.range());
							}

							if(step.index == 10 && step.direction == "down"){
								countries.style("opacity", 0);
								chorolegend.style("opacity", 0);
								landsilhouette.style("opacity", 0.3);
								caps.style("opacity", 0);
								graticule.style("opacity", 0);
								regions
									.transition().duration(1000)
									.delay((d, i) => i*20)
									.attrTween("d", function(d){
										return toCircle(d3.select(this).attr("d"), devLinearScale(+d.properties.gdppps16), countryScale(d.properties.CNTR_CODE), 6);
									});

								let yAxis = d3.axisLeft(countryScale)
									.tickSize(-width);

								mapOne.append("g")
									.attr("transform", "translate(30, 0)")
									.attr("class", "y-axis")
									.call(yAxis).lower();
							}
							if(step.index == 9 && step.direction == "up"){
								countries.style("opacity", 1)
									.style("fill-opacity", 0);
								chorolegend.style("opacity", 1);
								landsilhouette.style("opacity", 1);
								caps.style("opacity", 1);
								graticule.style("opacity", 1);
								d3.select(".y-axis").style("opacity", 0);
								regions
									.transition().duration(2000)
									.delay((d, i) => i*20)
									.attrTween("d", function(d){
										return fromCircle(devLinearScale(+d.properties.gdppps16), countryScale(d.properties.CNTR_CODE), 6, path(d.geometry));
									});							
							}
							if(step.index == 11 && step.direction == "down"){
								devLinearScale.domain([margin.left, 200])
								regions.transition().duration(1000)
								.attrTween("d", function(d){
									return toCircle(d3.select(this).attr("d"), devLinearScale(+d.properties.gdppps16), countryScale(d.properties.CNTR_CODE), 6);
								});
							}
							if(step.index == 10 && step.direction == "up"){
								devLinearScale.domain([margin.left, d3.max(geojsonNUTS2.features, (d) => +d.properties.gdppps16)]);
								regions.transition().duration(1000)
								.attrTween("d", function(d){
									return toCircle(d3.select(this).attr("d"), devLinearScale(+d.properties.gdppps16), countryScale(d.properties.CNTR_CODE), 6);
								});
							}
						}

						const devscale = d3.scaleThreshold()
							.domain([75, 90, 110, 125])
							//.range(['#e66101','#fdb863','#f7f7f7','#b2abd2','#5e3c99']);
							.range(["#2686A0","#94B9A7","#EDEAC2","#C6AA74","#A36B2B"].reverse());
							//.range(["#C75DAA","#DEA9CC","#CCCCCC","#7DC5C7","#009B9F"]);//PurpleGreen
							//.range(["#009392","#72aaa1","#f1eac8","#d98994","#d0587e"].reverse())

						const absfundScale = d3.scaleThreshold()
							.domain([200000000, 400000000, 1000000000, 5000000000])
							.range(['#edf8fb','#b3cde3','#8c96c6','#8856a7','#810f7c']);

						const percapitafundScale = d3.scaleThreshold()
							.domain([25, 50, 100, 200])
							.range(['#edf8fb','#b3cde3','#8c96c6','#8856a7','#810f7c']);

						const fundpercgdpScale = d3.scaleThreshold()
							.domain([1, 2, 3, 4])
							.range(['#edf8fb','#b3cde3','#8c96c6','#8856a7','#810f7c']);

						let geojsonNUTS2 = topojson.feature(nuts2, nuts2.objects.data);
						//TODO: remove from the topojson
						geojsonNUTS2.features = geojsonNUTS2.features.filter(function(region){
							return region.properties.CNTR_CODE != "TR" && region.properties.CNTR_CODE != "NO" && region.properties.CNTR_CODE != "CH" && region.properties.CNTR_CODE != "IS"  && region.properties.CNTR_CODE != "MK" && region.properties.CNTR_CODE != "ME";
						})

						const margin = {"top": 40, "left": 40, "bottom": 20, "right": 20};

						let countrycodes = countrydata.map((country) => country.geo);
						const countryScale = d3.scalePoint()
							.domain(countrycodes)
							.range([margin.top, height - margin.bottom])
						const devLinearScale = d3.scaleLinear()
							.domain([20, d3.max(geojsonNUTS2.features, (d) => +d.properties.gdppps16)])
							.range([margin.left, width - margin.right])

						//TODO: format numbers strings as numbers
						let geojsonNUTS0 = topojson.feature(nuts0, nuts0.objects.NUTS_RG_20M_2013_4326);

						const mapPadding = 10;
						projection.fitExtent([[mapPadding,mapPadding], [width - mapPadding, height - mapPadding]], geojsonNUTS2);

						let graticule  = mapOne.append("path")
							.datum(d3.geoGraticule())
							.attr("d", path)
							.attr("class", "graticule");

						let landsilhouette = mapOne.selectAll("path.land")
							.data(land.features)
							.enter().append("path")
							.attr("class", "land")
							.attr("d", path);

						let regions  = mapOne.selectAll("path.region")
							.data(geojsonNUTS2.features)
							.enter().append("path")
							.attr("class", "region")
							.attr("d", path)
							.attr("id", (d) => d.id)
							.style("fill", (d) => devscale(+d.properties.gdppps16));

						let countries = mapOne.selectAll("path.country")
							.data(geojsonNUTS0.features)
							.enter().append("path")
							.attr("class", "country")
							.attr("d", path)
							.attr("id", (d) => d.id)
							.style("fill", function(d){
								let regdata = regiondata.filter(function(el){
									return el.geo == d.id;
								});
								if(regdata.length == 0){ return "#f1f1f1"; }
								else{return devscale(regdata[0].gdppps16);}
							});

						let caps = mapOne.selectAll("circle.capital")
							.data(capitals.features)
							.enter().append("path")
							.attr("class", "capital")
							.attr("d", path.pointRadius(2))
							.attr("id", (d) => d.name);

						//Legend
						let chorolegend = mapOne.append("g")
						  .attr("class", "chorolegend tk-atlas")
						  .attr("transform", `translate(${width - 150},20)`);

						let legend = legendColor()
							.shapeWidth(50)
							.labelFormat(d3.format(".2f"))
							.labels(["Less developed", "In development", "Average", "Developed", "Very developed"])
							.scale(devscale);

						mapOne.select(".chorolegend")
							.call(legend);

						function histogrammifyLegend(histovalues, colors){
							const legendhistowidth = 100;
							let histoScale = d3.scaleLinear()
								.domain([0, d3.max(histovalues)])
								.range([0, legendhistowidth])
						
							d3.selectAll(".cell rect").data(histovalues)
								.transition().duration(1000)
								.style("fill", (d, i) => colors[i])
								.attr("width", (d) => histoScale(d))
								.attr("transform", (d) => `translate(${-histoScale(d) + 48},0)`);
						}

						let countrycounts = [7, 7, 6, 4, 4];
						histogrammifyLegend(countrycounts, devscale.range());

						function getRegionFrequencies(property, thresholds){
							let histo = d3.histogram()
								.value((d) => +d.properties[property])
								.thresholds(thresholds);
							return histo(geojsonNUTS2.features).map((bin) => bin.length);
						}
				
					})
				})
			})
		})
	});
}

export default { init, resize };