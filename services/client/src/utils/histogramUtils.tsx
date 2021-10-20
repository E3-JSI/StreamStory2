import * as d3 from "d3";
import { scale } from "./markovChainUtils";


export function createHistogram(stackedData: any, gBars: any, x: any, y: any, color: any, hoverClass: string) {
    gBars
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .join("g")
        .attr("fill", (d: any) => scale(color, d.key))
        .attr("class", (d: any) => `${d.key}`)
        .selectAll("rect")
        // enter a second tcroup per subgroup to add all rectangles
        .data((d: any) => d)
        .join("rect")
        .attr("x", (d: any) => scale(x, d.data.group))
        .attr("width", x.bandwidth())
        // .attr("y", (d: any) => y(0))
        // .attr("height", 0)
        // .transition()
        // .ease(d3.easeSin)
        // .duration(750)
        .attr("y", (d: any) => scale(y, d[1]))
        .attr("height", (d: any) => scale(y, d[0]) - scale(y, d[1]))


    gBars.on("mouseover", function (this: any) {
        const currParentClass = d3.select((this as any).parentNode).attr("class");

        if (currParentClass === hoverClass) {
            d3.select(this)
                .attr("fill", "#90e4fc");
        }
    })
    gBars.on("mouseout", function (this: any) {
        const currParentClass = d3.select((this as any).parentNode).attr("class");

        if (currParentClass === hoverClass) {
            d3.select(this)
                .attr("fill", "#5bc0de");
        }
    })
}

export function dummy() {
    return 1 + 2;
}