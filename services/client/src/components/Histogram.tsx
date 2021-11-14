import * as d3 from 'd3';
import { scaleOrdinal, easeQuadIn } from 'd3';
import React, { useRef, useEffect, useState } from 'react';

const Histogram = ({ histogram, totalHistogram }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [windowSize] = useState<any>({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        if (histogram && totalHistogram) {
            if (
                histogram.attrName.toLowerCase() === 'time' ||
                histogram.attrName.toLowerCase() === 'timestamp'
            ) {
                const boundsFn = () =>
                    Array.from(Array(totalHistogram.dayOfWeekFreqs.length), (_, i) => i);
                const freqFn = (data: any) => data.dayOfWeekFreqs;
                const totalFreqFn = () => totalHistogram.dayOfWeekFreqs;
                renderHistogram(boundsFn, freqFn, totalFreqFn);
            } else {
                const boundsFn = (data: any) => data.bounds;
                const freqFn = (data: any) => data.freqs;
                const totalFreqFn = () => totalHistogram.freqs;
                renderHistogram(boundsFn, freqFn, totalFreqFn);
            }
        }
    }, [histogram, totalHistogram, windowSize]); // eslint-disable-line react-hooks/exhaustive-deps

    function countDecimals(value: number) {
        if (Math.floor(value) === value) return 0;
        return value.toString().split('.')[1].length || 0;
    }

    function renderHistogram(boundsFn: any, freqFn: any, totalFreqFn: any) {
        const margin = { top: 10, right: 30, bottom: 20, left: 50 };
        const width = (containerRef?.current?.offsetWidth || 150) - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;
        const svg = d3
            .select(containerRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // svg.append('rect')
        //     .attr('width', width + margin.left + margin.right)
        //     .attr('height', height + margin.top + margin.bottom)
        //     .attr('fill', 'black');

        const subgroups = ['bluePart', 'greyPart'];
        const groups: any = boundsFn(histogram); // histogram.keys when categorical variable
        const color = scaleOrdinal(subgroups, ['#5bc0de', '#555555']); // 1st-blue, 2nd-grey

        const groupedData: any[] = freqFn(histogram).map((_: any, ix: number) => ({
            group: boundsFn(histogram)[ix],
            bluePart: freqFn(histogram)[ix],
            greyPart: totalFreqFn()[ix] - freqFn(histogram)[ix],
            total: totalFreqFn()[ix], // FIXME: debug only
        }));

        const stackedData: any[] = d3.stack().keys(subgroups)(groupedData);

        const divTooltip = d3.select(tooltipRef.current);

        const x = d3.scaleBand().domain(groups).range([0, width]).padding(0.2);
        svg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(
                d3
                    .axisBottom(x)
                    .tickValues(x.domain().filter((d: any, i: number) => !(i % 3)))
                    .tickFormat((d: any) => {
                        const nDecimals = countDecimals(d);
                        return nDecimals === 0 ? d : d.toFixed(Math.min(2, nDecimals));
                    })
                    .tickSizeOuter(0),
            );

        const totalArr: any[] = totalFreqFn().length ? totalFreqFn() : [];
        const maxCurr: number = d3.max(totalArr);

        const y = d3.scaleLinear().domain([0, maxCurr]).range([height, 0]);
        // svg.append('g').call(d3.axisLeft(y) /** .ticks(3) */);

        svg.append('g')
            .selectAll('g')
            .data(stackedData)
            .join('g')
            .attr('class', (d: any) => d.key)
            .attr('fill', (d: any) => color(d.key) as any)
            .selectAll('rect')
            .data((d: any) => d)
            .join('rect')
            .attr('x', (d: any) => {
                const val = x(d.data.group);
                return val ? val : ''; // eslint-disable-line no-unneeded-ternary
            })
            .attr('y', (d: any) => y(d[1]))
            .attr('height', (d: any) => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth())
            .on('mouseover', function (this: any, event: any, d: any) {
                const { parentNode } = this; // eslint-disable-line react/no-this-in-sfc
                const parentClass = d3.select(parentNode).attr('class');
                if (parentClass === 'bluePart') {
                    d3.select(this).style('cursor', 'pointer');
                    d3.select(this).attr('filter', ' brightness(0.7)');
                }
            })
            .on('mousemove', function (this: any, event: any, d: any) {
                const { parentNode } = this; // eslint-disable-line react/no-this-in-sfc
                const parentClass = d3.select(parentNode).attr('class');
                if (parentClass === 'bluePart') {
                    divTooltip
                        .style('position', 'absolute')
                        .style('position', 'absolute')
                        .style('background-color', 'black')
                        .style('color', 'white')
                        .style('border-radius', '5px')
                        .style('padding', '10px')
                        .style('top', `${event.pageY}px`)
                        .style('left', `${event.pageX + 20}px`)
                        .html(`(${d.data.bluePart})`)
                        .style('opacity', 0)
                        .transition()
                        .duration(200)
                        .style('opacity', '0.9');
                }
            })
            .on('mouseout', function (this: any) {
                const { parentNode } = this; // eslint-disable-line react/no-this-in-sfc
                const parentClass = d3.select(parentNode).attr('class');
                if (parentClass === 'bluePart') {
                    divTooltip.interrupt();
                    divTooltip.transition().ease(easeQuadIn).duration(200).style('opacity', 0);
                    d3.select(this).style('cursor', 'default');
                    d3.select(this).attr('filter', ' brightness(1)');
                }
            });
    }

    return (
        <>
            <div ref={tooltipRef} />
            <div ref={containerRef} style={{ backgroundColor: 'white' }} />
        </>
    );
};
export default Histogram;
