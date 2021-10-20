import { scaleOrdinal } from "d3";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { createHistogram } from "../utils/histogramUtils";
import { createBandScale, createLinearScale, xAxis, yAxis, createSVG, getSVG } from "../utils/markovChainUtils";


const Histogram = ({ histogram, totalHistogram }: any) => {

    const [initialized, setInitialized] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (histogram && (histogram.attrName !== 'Time')) {

            console.log("histogram:")
            console.log(histogram)
            console.log("totalHistogram:")
            console.log(totalHistogram)
            console.log("\n")

            renderHistogram(histogram);
        }
    }, [histogram, totalHistogram]) // eslint-disable-line react-hooks/exhaustive-deps


    function renderHistogram(dataOriginal: any) {
        const margin = { top: 10, right: 10, bottom: 10, left: 10, };
        const width = (containerRef?.current?.offsetWidth || 150) - margin.left - margin.right;
        const height = (containerRef?.current?.offsetHeight || 150) - margin.bottom - margin.top;

        const groupedData: any[] = histogram.freqs.map((_: any, ix: number) => ({
            group: histogram.bounds[ix],
            bluePart: histogram.freqs[ix],
            greyPart: totalHistogram.freqs[ix]
        }));

        const subgroups = ["bluePart", "greyPart"]
        const hoverClass = "bluePart";

        // List of groups = species here = value of the first column called group -> I show them on the X axis
        const groups: any = histogram.bounds;


        const x = createBandScale(groups, [0, width], 0.2);
        const y = createLinearScale([0, 60], [height, 0])

        // color palette = one color per subgroup
        const color = scaleOrdinal(subgroups, ['#5bc0de', '#555555']) // 1st-blue, 2nd-grey

        // stack the data? --> stack per subgroup
        const stackedData: any[] = d3.stack().keys(subgroups)(groupedData);

        let graph: any = null;
        let gBars = null;
        let xAxisContainer = null;
        let yAxisContainer = null;

        if (!initialized) {
            graph = createSVG(containerRef, width, height, margin);
            gBars = graph.append("g").attr("class", "bars");
            xAxisContainer = graph.append("g").attr("class", "x-axis");
            yAxisContainer = graph.append("g").attr("class", "y-axis");
            setInitialized(true);
        }
        else {
            graph = getSVG(containerRef, width, height, margin);
            gBars = graph.select("g.bars");
            xAxisContainer = graph.select("g.x-axis");
            yAxisContainer = graph.select("g.y-axis");
        }

        const xAxis2 = d3
            .axisBottom(x)
            .tickValues(x.domain().filter((_, i) => !(i % 5))) // scaleBand does not support ticks(...)
            .tickFormat((d: any) => d.toFixed(1))

        graph.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis2)


        xAxis(xAxisContainer, height - height * 0.1, x);
        yAxis(yAxisContainer, y, "Count");

        createHistogram(stackedData, gBars, x, y, color, hoverClass);
    }


    return (
        <>
            <div ref={containerRef} style={{ backgroundColor: "white" }} />
        </>
    );

};
export default Histogram;
