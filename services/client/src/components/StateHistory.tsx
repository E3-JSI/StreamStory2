import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import {
    createSVG,
    getSVG,
    createGraphContainer,
    getGraphContainer,
} from '../utils/commonChartUtils';
import { createDate, drawChart, highlightStates } from '../utils/stateHistoryUtils';

export interface StateHistoryProps {
    model: any; // eslint-disable-line
    selectedState: any; // eslint-disable-line
    onStateSelected: any; // eslint-disable-line
    commonStateData: any; // eslint-disable-line
}

export interface ChartDim {
    width?: number;
    height?: number;
}

function StateHistory({
    model,
    selectedState,
    onStateSelected,
    commonStateData,
}: StateHistoryProps): JSX.Element {
    const containerStateHistoryRef = useRef<HTMLDivElement>(null);
    const [initializedStateHistory, setInitializedStateHistory] = useState<boolean>(false);

    useEffect(() => {
        if (
            commonStateData &&
            model &&
            model.model &&
            model.model.scales &&
            model.model.scales.length
        ) {
            createStateHistory();
        }
    }, [model.model.scales, commonStateData]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (
            selectedState &&
            model &&
            model.model &&
            model.model.scales &&
            model.model.scales.length
        ) {
            highlightStates(selectedState, model);
        }
    }, [selectedState]); // eslint-disable-line react-hooks/exhaustive-deps

    function createStateHistory() {
        const width = containerStateHistoryRef?.current?.offsetWidth || 150; // FIXME: hardcoded
        const height = 450;
        const chart = { top: 10, left: 10 };
        const margin = { top: 20, right: 20, bottom: 20, left: 40 };
        const xWidth = width - chart.left - margin.left - margin.right;
        const baseHeight = height - chart.top - margin.top - margin.bottom;
        const subChartOffset = baseHeight * 0.1; // dist between top bars and brushBars
        const yWidth = 0.9 * (baseHeight - 2 * subChartOffset); // height of bars
        const yWidthPreview = 0.1 * (baseHeight - 2 * subChartOffset); // height of brushBars
        const xExtent: any = d3.extent(model.model.stateHistoryTimes, (d: number) => createDate(d)); // eslint-disable-line
        const yCategories: any = model.model.scales.map((el: any, i: any) => `${i}`); // eslint-disable-line
        const x = d3.scaleTime().domain(xExtent).range([0, xWidth]);
        const y = d3.scaleBand().domain(yCategories).range([yWidth, 0]).padding(0.1);
        const xBrush = d3.scaleTime().domain(xExtent).range([0, xWidth]);
        const yBrush = d3.scaleBand().domain(yCategories).range([yWidthPreview, 0]).padding(0.1);

        let graph: any = null; // eslint-disable-line
        let gGraphContainer: any = null; // eslint-disable-line
        let gGraphContainerClip: any = null; // eslint-disable-line
        let gBarsContainer: any = null; // eslint-disable-line
        let gBrushBarsContainer: any = null; // eslint-disable-line
        let gAxisX: any = null; // eslint-disable-line
        let gAxisXBrush: any = null; // eslint-disable-line
        let gBars: any = null; // eslint-disable-line
        let gBrushBars: any = null; // eslint-disable-line

        if (!initializedStateHistory) {
            graph = createSVG(containerStateHistoryRef, width, height, margin);
            graph
                .append('defs')
                .append('clipPath')
                .attr('id', 'clip')
                .append('SVG:rect')
                .attr('width', xWidth)
                .attr('height', baseHeight)
                .attr('x', 0)
                .attr('y', 0);
            gGraphContainer = createGraphContainer(graph, width, height, chart);
            gGraphContainerClip = gGraphContainer
                .append('g')
                .attr('class', 'graphContainerClip')
                .attr('clip-path', 'url(#clip)');
            gBarsContainer = gGraphContainerClip.append('g').attr('class', 'barsContainer');
            gBars = gBarsContainer.append('g').attr('class', 'bars');
            gAxisX = gBarsContainer.append('g').attr('class', 'xAxis');
            gBrushBarsContainer = gGraphContainerClip
                .append('g')
                .attr('class', 'brushBarsContainer');
            gBrushBars = gBrushBarsContainer.append('g').attr('class', 'brushBars');
            gAxisXBrush = gBrushBarsContainer.append('g').attr('class', 'xAxisBrush');
            setInitializedStateHistory(true);
        } else {
            graph = getSVG(containerStateHistoryRef, width, height, margin);
            gGraphContainer = getGraphContainer(graph);
            gGraphContainerClip = gGraphContainer
                .select('.graphContainerClip')
                .attr('clip-path', 'url(#clip)');
            gBarsContainer = gGraphContainerClip.select('g.barsContainer');
            gBars = gBarsContainer.select('g.bars');
            gAxisX = gBarsContainer.select('g.xAxis');
            gBrushBarsContainer = gGraphContainerClip.select('g.brushBarsContainer');
            gBrushBars = gBrushBarsContainer.select('g.brushBars');
            gAxisXBrush = gBrushBarsContainer.select('g.xAxisBrush');
        }
        gBrushBarsContainer.attr('transform', `translate(0, ${yWidth + subChartOffset})`);
        const xAxis = d3.axisBottom(x).tickSizeOuter(0);
        gAxisX.attr('transform', `translate(0, ${yWidth})`).call(xAxis);
        const xAxisBrush: any = d3.axisBottom(xBrush).tickSizeOuter(0); // eslint-disable-line
        gAxisXBrush.attr('transform', `translate(0, ${yWidthPreview})`).call(xAxisBrush);

        drawChart(
            gBars,
            gBrushBars,
            gAxisX,
            model,
            x,
            y,
            xBrush,
            yBrush,
            xWidth,
            yWidthPreview,
            width,
            height,
            selectedState,
            handleOnStateSelected,
        );
    }

    function handleOnStateSelected(state: any) {
        onStateSelected(state);
    }

    return <div ref={containerStateHistoryRef} />;
}

export default StateHistory;
