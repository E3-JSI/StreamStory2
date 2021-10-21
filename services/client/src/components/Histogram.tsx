import { scaleOrdinal } from "d3";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { createHistogram } from "../utils/histogramUtils";
import { createBandScale, createLinearScale, xAxis, yAxis, createSVG, getSVG } from "../utils/markovChainUtils";


const Histogram = ({ histogram, totalHistogram }: any) => {

    const [initialized, setInitialized] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const containerRefHistogram = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (histogram && (histogram.attrName !== 'Time')) {
            const boundsFn = (data: any) => data.bounds
            const freqFn = (data: any) => data.freqs
            const totalFreqFn = () => totalHistogram.freqs;

            renderHistogram(boundsFn, freqFn, totalFreqFn);

        } else if (histogram.attrName === 'Time') {
            console.log("===== time ==============")
            console.log("histogram:")
            console.log(histogram)
            console.log("totalHistogram:")
            console.log(totalHistogram)
            console.log("\n")

            const boundsFn = () => Array.from(Array(totalHistogram.dayOfWeekFreqs.length), (_, i) => i)
            const freqFn = (data: any) => data.dayOfWeekFreqs
            const totalFreqFn = () => totalHistogram.dayOfWeekFreqs;

            renderHistogram(boundsFn, freqFn, totalFreqFn);
        }
    }, [histogram, totalHistogram]) // eslint-disable-line react-hooks/exhaustive-deps


    function renderHistogram(boundsFn: any, freqFn: any, totalFreqFn: any) {

        const margin = { top: 10, right: 30, bottom: 20, left: 50 }
        const width = 460 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);


        const subgroups = ["bluePart", "greyPart"]

        const groups: any = boundsFn(histogram); // histogram.keys when categorical variable

        const color = scaleOrdinal(subgroups, ['#5bc0de', '#555555']) // 1st-blue, 2nd-grey

        const groupedData: any[] = freqFn(histogram).map((_: any, ix: number) => ({
            group: boundsFn(histogram)[ix],
            bluePart: freqFn(histogram)[ix],
            greyPart: totalFreqFn()[ix] - freqFn(histogram)[ix],
        }));

        const stackedData: any[] = d3.stack().keys(subgroups)(groupedData);

        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding(0.2)
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3.scaleLinear()
            .domain([0, 60])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));


        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .join("g")
            .attr("fill", (d: any) => color(d.key) as any)
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", (d: any) => {
                const val = x(d.data.group);
                return val ? val : "";  // eslint-disable-line no-unneeded-ternary
            })
            .attr("y", (d: any) => y(d[1]))
            .attr("height", (d: any) => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())

    }

    return (
        <>
            <div ref={containerRef} style={{ backgroundColor: "white" }} />
        </>
    );

};
export default Histogram;
