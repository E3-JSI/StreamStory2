import React from 'react';
import * as d3 from 'd3';

export interface Margin {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

export function createSVG(
    container: React.MutableRefObject<any>,
    width: number,
    height: number,
    margin: Margin,
) {
    const svg = d3
        .select(container.current)
        .append('svg')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .append('g')
        .attr('class', 'graph')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg.append('rect')
        .attr('class', 'zoom_rect')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'green')
        .attr('opacity', 0);

    return svg;
}

export function getSVG(
    container: React.MutableRefObject<any>,
    width: number,
    height: number,
    margin: Margin,
) {
    const svg = d3.select(container.current).select('svg');
    svg.attr('width', width).attr('height', height);

    const g = svg.select('g.graph');
    g.attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    return g;
}

export function createGraphContainer(
    g: any, // eslint-disable-line
    width: number,
    height: number,
    chart: any, // eslint-disable-line
) {
    return g
        .append('g')
        .attr('class', 'graphContainer')
        .attr('width', width - chart.left)
        .attr('height', height - chart.top)
        .attr('transform', `translate(${chart.left}, ${chart.top})`);
}

export function getGraphContainer(svg: any) {
    return svg.select('g.graphContainer');
}
