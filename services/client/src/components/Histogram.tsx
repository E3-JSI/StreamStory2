import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { scaleOrdinal } from 'd3';
import {
    createSVG,
    getSVG,
    createGraphContainer,
    getGraphContainer,
} from '../utils/commonChartUtils';
import {
    createAxisBottom,
    createGroupedData,
    DAYS_OF_WEEK,
    MONTHS,
    renderStackedHistograms,
} from '../utils/histogramUtils';

export interface HistogramProps {
    histogram: any; // eslint-disable-line
    totalHistogram: any; // eslint-disable-line
    timeType?: any; // eslint-disable-line
}

export interface ChartDim {
    width?: number;
    height?: number;
}

const Histogram = ({ histogram, totalHistogram, timeType }: HistogramProps): JSX.Element => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [initiliazed, setInitiliazed] = useState(false);
    const [windowSize, setWindowSize] = useState<ChartDim>({
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
                    freqFn = (data: any) => data.dayOfWeekFreqs; // eslint-disable-line
                    totalFreqFn = () => totalHistogram.dayOfWeekFreqs;
                    domain = DAYS_OF_WEEK;
                } else if (timeType === 'month') {
                    boundLen = totalHistogram.monthFreqs.length;
                    freqFn = (data: any) => data.monthFreqs; // eslint-disable-line
                    totalFreqFn = () => totalHistogram.monthFreqs;
                    domain = MONTHS;
                } else {
                    boundLen = totalHistogram.hourFreqs.length;
                    freqFn = (data: any) => data.hourFreqs; // eslint-disable-line
                    totalFreqFn = () => totalHistogram.hourFreqs;
                    domain = Array.from(Array(boundLen), (_, i) => i + 1);
                }
            } else {
                domain = histogram.bounds;
                freqFn = (data: any) => data.freqs; // eslint-disable-line
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

    function renderHistogram(
        domain: any, // eslint-disable-line
        subgroups: any, // eslint-disable-line
        parentId: any, // eslint-disable-line
        freqFn: any, // eslint-disable-line
        totalFreqFn: any, // eslint-disable-line
    ) {
        const width = containerRef?.current?.offsetWidth || 150;
        const height = 220;
        const margin = { top: 5, left: 5, right: 5, bottom: 5 };
        const chart = { top: 0, bottom: 22, left: 5, right: 0 };
        const xWidth = width - margin.left - margin.right - chart.left - chart.right;
        const yWidth = height - margin.top - margin.bottom - chart.top - chart.bottom;
        const color = scaleOrdinal(subgroups, ['#5bc0de', '#6c6c6c']); // 1st-blue, 2nd-grey
        const x = d3.scaleBand().domain(domain).range([0, xWidth]).padding(0.2);
        const y = d3
            .scaleLinear()
            .domain([0, d3.max((totalFreqFn().length ? totalFreqFn() : []) as any[])]) // eslint-disable-line
            .range([yWidth, 0]);

        let graph = null;
        let graphContainer = null;
        let axisBottom: any = null; // eslint-disable-line
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
        axisBottom.attr('transform', `translate(0, ${yWidth})`).call(createAxisBottom(x, timeType));
        const divTooltip = d3.select(tooltipRef.current);
        const stackedData = d3.stack().keys(subgroups)(
            createGroupedData(histogram, timeType, freqFn, totalFreqFn, domain),
        );
        renderStackedHistograms(
            histogram,
            stackedData,
            gStackedBars,
            divTooltip,
            parentId,
            x,
            y,
            color,
        );
    }

    return (
        <>
            <div ref={tooltipRef} />
            <div ref={containerRef} />
        </>
    );
};
export default Histogram;
