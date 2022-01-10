import * as d3 from 'd3';
import { scaleOrdinal, easeQuadIn } from 'd3';
import React, { useRef, useEffect, useState } from 'react';
import { createSVG, getSVG } from '../utils/markovChainUtils';

const Histogram = ({ histogram, totalHistogram, timeType }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [initiliazed, setInitiliazed] = useState(false);
    const [windowSize, setWindowSize] = useState<any>({
        width: undefined,
        height: undefined,
    });

    useEffect(() => {
        if (histogram && totalHistogram) {
            let domain = [];
            let freqFn = null;
            let totalFreqFn = null;
            let boundLen = 0;
            if (!Object.prototype.hasOwnProperty.call(histogram, 'bounds')) {
                if (timeType === 'dayOfWeek') {
                    boundLen = totalHistogram.dayOfWeekFreqs.length;
                    freqFn = (data: any) => data.dayOfWeekFreqs;
                    totalFreqFn = () => totalHistogram.dayOfWeekFreqs;
                    domain = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                } else if (timeType === 'month') {
                    boundLen = totalHistogram.monthFreqs.length;
                    freqFn = (data: any) => data.monthFreqs;
                    totalFreqFn = () => totalHistogram.monthFreqs;
                    domain = [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                    ];
                } else {
                    boundLen = totalHistogram.hourFreqs.length;
                    freqFn = (data: any) => data.hourFreqs;
                    totalFreqFn = () => totalHistogram.hourFreqs;
                    domain = Array.from(Array(boundLen), (_, i) => i + 1);
                }
            } else {
                domain = histogram.bounds;
                freqFn = (data: any) => data.freqs;
                totalFreqFn = () => totalHistogram.freqs;
            }
            if (histogram != null && freqFn(histogram) != null && freqFn(histogram).length > 0) {
                const subgroups = timeType == null ? ['bluePart', 'greyPart'] : ['bluePart'];
                const parentId = subgroups[0]; // bluePart
                renderHistogram(domain, subgroups, parentId, freqFn, totalFreqFn);
            }
        }
    }, [histogram, totalHistogram, timeType, windowSize]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function countDecimals(value: number) {
        if (Math.floor(value) === value) return 0;
        return value.toString().split('.')[1].length || 0;
    }

    function renderHistogram(
        domain: any,
        subgroups: any,
        parentId: any,
        freqFn: any,
        totalFreqFn: any,
    ) {
        const width = containerRef?.current?.offsetWidth || 150;
        const height = 220;
        const margin = { top: 5, left: 5, right: 5, bottom: 5 };
        const chart = { top: 10, bottom: 10, left: 5, right: 0 };

        const xWidth = width - margin.left - margin.right - chart.left - chart.right;
        const yWidth = height - margin.top - margin.bottom - chart.top - chart.bottom;

        const color = scaleOrdinal(subgroups, ['#5bc0de', '#6c6c6c']); // 1st-blue, 2nd-grey

        const x = d3.scaleBand().domain(domain).range([0, xWidth]).padding(0.2);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max((totalFreqFn().length ? totalFreqFn() : []) as any[])])
            .range([yWidth, 0]);

        let graph = null;
        let graphContainer = null;
        let axisBottom: any = null;
        let gStackedBars = null;

        if (!initiliazed) {
            graph = createSVG(containerRef, width, height, margin);
            graphContainer = createGraphContainer(graph, xWidth, yWidth, chart);
            axisBottom = graphContainer.append('g').attr('class', 'axisBottom');
            gStackedBars = graphContainer.append('g').attr('class', 'stackedBars');
            setInitiliazed(true);
        } else {
            graph = getSVG(containerRef, width, height, margin);
            graphContainer = getGraphContainer(graph);
            axisBottom = graphContainer.select('g.axisBottom');
            gStackedBars = graphContainer.select('g.stackedBars');
        }

        axisBottom.attr('transform', `translate(0, ${yWidth})`).call(createAxisBottom(x));

        const divTooltip = d3.select(tooltipRef.current);

        const stackedData = d3.stack().keys(subgroups)(
            createGroupedData(freqFn, totalFreqFn, domain),
        );

        renderStackedHistograms(stackedData, gStackedBars, divTooltip, parentId, x, y, color);
    }

    function renderStackedHistograms(
        stackedData: any,
        gStackedBars: any,
        divTooltip: any,
        parentId: any,
        x: any,
        y: any,
        color: any,
    ) {
        const gGroups = gStackedBars
            .selectAll('.subgroup_g')
            .data(stackedData, (d: any) => `${d.key}`)
            .join(
                (enter: any) =>
                    enter
                        .append('g')
                        .attr('class', 'subgroup_g')
                        .attr('id', (d: any) => `${d.key}`)
                        .attr('fill', (d: any) => color(d.key)),
                (update: any) => update,
                (exit: any) => exit.remove(),
            );

        const rects = gGroups
            .selectAll('.subgroup_rect')
            .data((d: any) => d)
            .join(
                (enter: any) =>
                    enter
                        .append('rect')
                        .attr('class', 'subgroup_rect')
                        .attr('x', (d: any) => (x(d.data.group) ? x(d.data.group) : ''))
                        .attr('y', (d: any) => y(d[1]))
                        .attr('height', (d: any) => y(d[0]) - y(d[1]))
                        .attr('width', x.bandwidth()),
                (update: any) =>
                    update
                        .attr('x', (d: any) => (x(d.data.group) ? x(d.data.group) : ''))
                        .attr('y', (d: any) => y(d[1]))
                        .attr('height', (d: any) => y(d[0]) - y(d[1]))
                        .attr('width', x.bandwidth()),
                (exit: any) => exit.remove(),
            );

        rects
            .on('mouseover', function (this: any, event: any, d: any) {
                const { parentNode } = this; // eslint-disable-line react/no-this-in-sfc
                const id = d3.select(parentNode).attr('id');

                if (id === parentId) {
                    d3.select(this).style('cursor', 'pointer');
                    // d3.select(this).attr('filter', ' brightness(0.7)');
                    d3.select(this).style(
                        'filter',
                        ' brightness(0.7) drop-shadow(0px 0px 0.5px rgba(0, 0, 0, .5))',
                    );
                }
            })
            .on('mousemove', function (this: any, event: any, d: any) {
                const { parentNode } = this; // eslint-disable-line react/no-this-in-sfc
                const id = d3.select(parentNode).attr('id');
                if (id === parentId) {
                    divTooltip
                        .style('position', 'absolute')
                        .style('background-color', 'black')
                        .style('color', 'white')
                        .style('border-radius', '5px')
                        .style('padding', '10px')
                        .style('top', `${event.pageY}px`)
                        .style('left', `${event.pageX + 20}px`)
                        .html(() => createTooltipHtml(d))
                        .style('opacity', 0)
                        .transition()
                        .duration(200)
                        .style('opacity', '0.9');
                }
            })
            .on('mouseout', function (this: any) {
                const { parentNode } = this; // eslint-disable-line react/no-this-in-sfc
                const id = d3.select(parentNode).attr('id');
                if (id === parentId) {
                    divTooltip.interrupt();
                    divTooltip.transition().ease(easeQuadIn).duration(200).style('opacity', 0);
                    d3.select(this).style('cursor', 'default');
                    // d3.select(this).attr('filter', ' brightness(1)');
                    d3.select(this).style(
                        'filter',
                        'brightness(1) drop-shadow(0px 0px 0px rgba(0, 0, 0, 0))',
                    );
                }
            });
    }

    function createGraphContainer(g: any, xWidth: number, yWidth: number, chart: any) {
        return g
            .append('g')
            .attr('class', 'graphContainer')
            .attr('width', xWidth - chart.left - chart.right)
            .attr('height', yWidth - chart.top - chart.bottom)
            .attr('transform', `translate(${0}, ${0})`);
    }

    function getGraphContainer(svg: any) {
        return svg.select('g.graphContainer');
    }

    function createTooltipHtml(d: any) {
        const prob = d.data.bluePart / histogram.freqSum;
        const nDecimals = countDecimals(prob);
        const probFormated = nDecimals === 0 ? prob : prob.toFixed(Math.min(4, nDecimals));
        return `${probFormated} (${d.data.bluePart})`;
    }

    function createGroupedData(freqFn: any, totalFreqFn: any, domain: any) {
        return freqFn(histogram).map((_: any, ix: number) => {
            const rez: any = {};
            rez.group = domain[ix];
            rez.bluePart = freqFn(histogram)[ix];

            if (timeType == null) {
                rez.greyPart = totalFreqFn()[ix] - freqFn(histogram)[ix];
            }
            return rez;
        });
    }

    function createAxisBottom(x: any) {
        return d3
            .axisBottom(x)
            .tickValues(
                x.domain().filter((d: any, i: number) => {
                    if (timeType == null) {
                        return !(i % 3);
                    }
                    return true;
                }),
            )
            .tickFormat((d: any) => {
                if (typeof d === 'number') {
                    const nDecimals = countDecimals(d);
                    return nDecimals === 0 ? d : d.toFixed(Math.min(2, nDecimals));
                }
                return d;
            })
            .tickSizeOuter(0);
    }

    return (
        <>
            <div ref={tooltipRef} />
            <div ref={containerRef} />
        </>
    );
};
export default Histogram;
