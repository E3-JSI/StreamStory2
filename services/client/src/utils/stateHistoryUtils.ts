import React from 'react';
import * as d3 from 'd3';
import { scaleOrdinal, easeQuadIn } from 'd3';

export function drawChart(
    gBars: any,
    gBrushBars: any,
    gAxisX: any,
    model: any,
    x: any,
    y: any,
    xBrush: any,
    yBrush: any,
    xWidth: any,
    yWidthPreview: any,
    width: any,
    height: any,
    selectedState: any,
    stateSeletedCallback: any,
) {
    const dataCurr = createDataCurr(model);
    const levels = gBars
        .selectAll('g')
        .data(dataCurr, (d: any) => d.scaleIx) // eslint-disable-line
        .join('g')
        .attr('class', 'level')
        .attr('id', (d: any) => `scale_${d.scaleIx}`); // eslint-disable-line

    createLevelRects(levels, x, y)
        .on('mouseover', function (this: any) {
            d3.select(this).style('cursor', 'pointer');
        })
        .on('mouseout', function (this: any) {
            d3.select(this).style('cursor', 'default');
        })
        .on('click', (event: any, d: any) => highlightStates(d, model, stateSeletedCallback)); // eslint-disable-line

    const brushLevels = gBrushBars
        .selectAll('g')
        .data(dataCurr, (d: any) => d.scaleIx)
        .join('g')
        .attr('class', 'brushLevel')
        .attr('id', (d: any) => `scale_${d.scaleIx}`); // eslint-disable-line

    createLevelRects(brushLevels, xBrush, yBrush);

    let sourceEvent: any = null; // eslint-disable-line

    const brush = createBrush(xWidth, yWidthPreview, xBrush, x, y, gAxisX, levels);

    const zoom = createZoom(
        width,
        height,
        sourceEvent,
        x,
        y,
        xBrush,
        gBrushBars,
        brush,
        gAxisX,
        levels,
    );

    gBars.call(zoom);
    gBrushBars.call(brush).call(brush.move, xBrush.range());

    if (selectedState != null && selectedState.stateNo != null) {
        const scFound = dataCurr.find((d: any) => d.scaleIx === selectedState.scaleIx);
        if (scFound && scFound.states) {
            const dFound = scFound.states.find(
                (d: any) => d.stateNo === `${selectedState.stateNo}`,
            );
            if (dFound != null) {
                highlightStates(dFound, model, stateSeletedCallback);
            }
        }
    }
}

function createLevelRects(levels: any, x: any, y: any) {
    return levels
        .selectAll('rect')
        .data(
            (d: any) => d.states, // eslint-disable-line
            (d: any) => `scaleIx_${d.scaleIx}_start_${d.start}_end_${d.end}`, // eslint-disable-line
        )
        .join('rect')
        .attr('class', 'state')
        .attr('id', (d: any) => `${d.stateNo}`) // eslint-disable-line
        .attr('x', (d: any) => x(d.start)) // eslint-disable-line
        .attr('y', (d: any) => y(`${d.scaleIx}`)) // eslint-disable-line
        .attr('width', (d: any) => x(d.end) - x(d.start)) // eslint-disable-line
        .attr('height', (d: any) => y.bandwidth()) // eslint-disable-line
        .attr('fill', (d: any) => d.color); // eslint-disable-line
}

function createBrush(
    xWidth: any,
    yWidthPreview: any,
    xBrush: any,
    x: any,
    y: any,
    gAxisX: any,
    levels: any,
) {
    return d3
        .brushX()
        .extent([
            [0, 0],
            [xWidth, yWidthPreview],
        ])
        .on('brush start', () => {
            d3.select('.selection').attr('opacity', 0.6).attr('fill', 'blue');

            d3.selectAll('rect.handle')
                .attr('fill', 'black')
                .attr('width', '5')
                .attr('opacity', 0.8)
                .attr('rx', 3);
        })
        .on(
            'brush end',
            function (
                this: any, // eslint-disable-line
                event: any, // eslint-disable-line
            ) {
                const rangeSelection: any = d3.brushSelection(this);
                if (rangeSelection != null && event.sourceEvent != null) {
                    const xAxisNewRange = rangeSelection.map(xBrush.invert);
                    x.domain(xAxisNewRange);
                    gAxisX.call(d3.axisBottom(x).tickSizeOuter(0));
                    createLevelRects(levels, x, y);
                }
            },
        );
}

function createZoom(
    width: any,
    height: any,
    sourceEvent: any,
    x: any,
    y: any,
    xBrush: any,
    gBrushBars: any,
    brush: any,
    gAxisX: any,
    levels: any,
) {
    return d3
        .zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([
            [0, 0],
            [width, height],
        ])
        .extent([
            [0, 0],
            [width, height],
        ])
        .on('zoom', (event: any) => {
            if (sourceEvent === 'brush') return; // ignore zoom-by-brush
            sourceEvent = 'zoom'; // eslint-disable-line
            const t = event.transform as any; // eslint-disable-line
            x.domain(t.rescaleX(xBrush).domain());
            gBrushBars.call(brush).call(brush.move, (x as any).range().map(t.invertX, t));
            sourceEvent = null; // eslint-disable-line
            gAxisX.call(d3.axisBottom(x).tickSizeOuter(0));
            createLevelRects(levels, x, y);
        });
}

export function highlightStates(d: any, model: any, stateSeletedCallback?: any) {
    const scaleCurr = model.model.scales[d.scaleIx];
    if (scaleCurr) {
        const stateFound = scaleCurr.states.find((st: any) => d.stateNo === `${st.stateNo}`);
        if (stateFound && stateSeletedCallback) {
            stateSeletedCallback(stateFound);
        }
    }

    d3.selectAll(`.level > rect.state`)
        .style('stroke', 'white')
        .style(
            'stroke-width',
            function (
                this: any, // eslint-disable-line
                dCurr: any, // eslint-disable-line
            ) {
                let strokeWidth = '0px';
                const result = d.initialStates.every(
                    (
                        initState: any, // eslint-disable-line
                    ) => dCurr.initialStates.includes(initState),
                );
                const selectionThis = d3.select(this);

                if (
                    (dCurr.scaleIx === d.scaleIx && dCurr.stateNo === d.stateNo) ||
                    (dCurr.scaleIx !== d.scaleIx && result)
                ) {
                    strokeWidth = '2px';
                    selectionThis
                        .style('filter', 'drop-shadow(0px 0px 5px rgba(0, 0, 0, .5))')
                        .raise();
                } else {
                    selectionThis.style('filter', 'none');
                }
                return strokeWidth;
            },
        );
}

export function createDataCurr(model: any) {
    const {
        model: { scales, stateHistoryInitialStates: initialStates, stateHistoryTimes: times },
    } = model;
    const dataCurr: any = []; // eslint-disable-line

    scales.forEach((sc: any, scaleIx: number) => {
        const statesCurr: any = []; // eslint-disable-line

        if (scaleIx === 0) {
            initialStates.forEach((initState: any, stateIx: number) => {
                const state = scales[scaleIx].states.find(
                    (currState: any) => currState.stateNo === initState, // eslint-disable-line
                );
                statesCurr.push({
                    start: createDate(times[stateIx]),
                    end: createDate(times[stateIx + 1]),
                    initialStates: state.initialStates,
                    stateNo: `${initialStates[stateIx]}`,
                    scaleIx: `${scaleIx}`,
                    color: state.color,
                });
            });
        } else {
            const initStatesDict: any = {}; // eslint-disable-line

            for (let j = 0; j < scales[scaleIx].states.length; j++) {
                const state = scales[scaleIx].states[j];

                for (let k = 0; k < state.initialStates.length; k++) {
                    const initialState = state.initialStates[k];
                    initStatesDict[initialState] = state.stateNo;
                }
            }
            let startIx = 0;

            initialStates.forEach((s: any, stIx: number) => {
                const startStateNo = initStatesDict[initialStates[startIx]];
                const currStateNo = initStatesDict[initialStates[stIx]];
                let startIxNew = -1;

                if (currStateNo !== startStateNo) {
                    startIxNew = stIx;
                }
                if (currStateNo === startStateNo && stIx < initialStates.length - 1) {
                    return;
                }
                const stateCurr = sc.states.find(
                    (state: any) => state.stateNo === startStateNo, // eslint-disable-line
                );
                statesCurr.push({
                    start: createDate(times[startIx]),
                    end: createDate(times[stIx]),
                    initialStates: stateCurr.initialStates,
                    stateNo: `${initStatesDict[initialStates[startIx]]}`,
                    scaleIx: `${scaleIx}`,
                    color: stateCurr.color,
                });
                startIx = startIxNew;
            });
        }
        dataCurr.push({ scaleIx, states: statesCurr });
    });
    return dataCurr;
}

export function createDate(unixTimestamp: number) {
    return new Date(unixTimestamp * 1000);
}
