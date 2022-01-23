import React from 'react';
import * as d3 from 'd3';
import { easeQuadIn } from 'd3';

export function renderStackedHistograms(
    histogram: any,
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
                    .html(() => createTooltipHtml(d, histogram))
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

export function createGraphContainer(g: any, xWidth: number, yWidth: number, chart: any) {
    return g
        .append('g')
        .attr('class', 'graphContainer')
        .attr('width', xWidth - chart.left - chart.right)
        .attr('height', yWidth - chart.top - chart.bottom)
        .attr('transform', `translate(${0}, ${0})`);
}

export function getGraphContainer(svg: any) {
    return svg.select('g.graphContainer');
}

export function createTooltipHtml(d: any, histogram: any) {
    const prob = d.data.bluePart / histogram.freqSum;
    const nDecimals = countDecimals(prob);
    const probFormated = nDecimals === 0 ? prob : prob.toFixed(Math.min(4, nDecimals));
    return `${probFormated} (${d.data.bluePart})`;
}

export function createGroupedData(
    histogram: any,
    timeType: any,
    freqFn: any,
    totalFreqFn: any,
    domain: any,
) {
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

export function createAxisBottom(x: any, timeType: any) {
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

export function countDecimals(value: number) {
    if (Math.floor(value) === value) return 0;
    return value.toString().split('.')[1].length || 0;
}

export const MONTHS = [
    // TODO: refacator, move to consts
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

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // TODO: move
