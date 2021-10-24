import * as d3 from "d3";


export function createSlider(gSlider: any, x: any, precision: number, format: any, margin: any, onSliderValChange: any) {

    const slider = gSlider
        .attr("transform", `translate(${10}, ${0})`);

    slider.append("line")
        .attr("class", "track")
        .style("stroke-linecap", "round")

        .style("stroke", "#000")
        .style("stroke-opacity", "0.3")
        .style("stroke-width", "10px")

        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function (this: any) { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .style("stroke-linecap", "round")
        .style("stroke", "#dcdcdc")
        .style("stroke-width", "8px")

        .select(function (this: any) { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .style("stroke-linecap", "round")
        .style("pointer-events", "stroke")
        .style("stroke-width", "50px")
        .style("stroke", "transparent")
        .style("cursor", "crosshair")

        .call(d3.drag()
            .on("start", function (this: any) { return d3.select(this).interrupt() })
            .on("drag", (event: any) => update(x.invert(event.x)))
        )

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .style("font-size", "10px")
        .attr("transform", `translate(${0},${18})`)
        .selectAll("text")
        .data(x.ticks(10))
        .enter()
        .append("text")
        .style("fill", "white")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text((d: any) => format(d));

    const handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")

        .style("fill", "#fff")
        .style("stroke", "#000")
        .style("stroke-opacity", "0.5")
        .style("stroke-width", "1.25px")
        .attr("r", 9);

    const label = slider
        .append("text")
        .attr("class", "label")
        .style("fill", "white")
        .attr("text-anchor", "middle")
        .text(x.domain()[0])
        .attr("transform", `translate(${0}, -25)`)

    function update(h: any) {
        onSliderValChange(h);
        handle.attr("cx", x(h));
        label
            .attr("x", x(h))
            .text(format(h))
    }
}

export function test() {
    console.log("test")
}