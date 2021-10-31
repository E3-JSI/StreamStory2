import React from 'react';
import * as d3 from 'd3';
import { easeLinear, easeQuad } from 'd3';
import { ITransitionProps, LinkType } from '../types/charts';

export function scale(s: any, value: any) {
    return s(value);
}

export function createGraphContainer(g: any, width: number, height: number, chart: any) {
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

export function createSVG(
    container: React.MutableRefObject<any>,
    width: number,
    height: number,
    margin: any,
) {
    return d3
        .select(container.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('class', 'graph')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
}

export function getSVG(
    container: React.MutableRefObject<any>,
    width: number,
    height: number,
    margin: any,
) {
    const svg = d3.select(container.current).select('svg');
    svg.attr('width', width).attr('height', height);

    const g = svg.select('g.graph');
    g.attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    return g;
}

export function createNodesMap(gNodes: any) {
    const nodesMap: any = {};

    selectAllNodeGroups(gNodes).each(function (this: any) {
        const item = d3.select(this);
        const d: any = item.data()[0];
        nodesMap[d.id] = item;
    });
    return nodesMap;
}

export function createLinks(
    theme: any,
    data: any,
    gNodes: any,
    gLinks: any,
    transitionProps: ITransitionProps,
) {
    const { tEnter } = getTransitionsFromProps(gLinks, transitionProps);
    const linkGroups = selectAllLinkGroups(gLinks);

    const links = linkGroups
        .data(data.links, (d: any) => `link_s${d.source}t${d.target}`)
        .join(
            (enter: any) => {
                const tmp = enter
                    .append('g')
                    .attr('class', 'link_group')
                    .attr('id', (d: any) => `link_s${d.source}t${d.target}`)
                    .attr('opacity', 0);

                tmp.append('path')
                    .attr('class', 'link_path')
                    .attr('id', (d: any, i: number) => `path_s${d.source}t${d.target}`)
                    .attr('stroke', theme.link.default.stroke)
                    .attr('stroke-width', (d: any) => Math.log(6 * d.p) + 0.5)
                    .attr('fill', 'none')
                    .attr('marker-end', (d: any) => `url(#arrow_s${d.source}_t${d.target})`);

                selectLinkPath(tmp).attr('d', (d: any) =>
                    drawLineWithOffset(createNodesMap(gNodes), d),
                );

                tmp.call((entr: any) => entr.transition(entr).attr('opacity', 1));
                return tmp;
            },
            (update: any) => {
                selectLinkPath(update).attr('d', (d: any) =>
                    drawLineWithOffset(createNodesMap(gNodes), d),
                );

                update.call((updt: any) => updt.transition(tEnter).attr('opacity', 1));

                return update;
            },
            (exit: any) => {
                exit.remove();
                return exit;
            },
        );
    links
        .append('text')
        .attr('fill', 'white')
        .append('textPath')
        .attr('class', 'textpath')
        .attr('text-anchor', 'middle')
        .attr('startOffset', '20%')
        .attr('xlink:href', (d: any, i: any) => `#path_s${d.source}t${d.target}`)
        .text((d: any) => formatLinkP(d.p));

    return links;
}

export function formatLinkP(p: number) {
    let zerosCount = 0;
    let startCount = false;
    const pStr = p.toString();

    for (let i = 0; i < pStr.length; i++) {
        if (pStr[i] === '.') {
            startCount = true;
        } else if (startCount && pStr[i] === '0') {
            zerosCount += 1;
        } else if (startCount && pStr[i] !== '0') {
            break;
        }
    }
    const numOfPlaces = zerosCount === 0 ? 2 : zerosCount + 2;
    return `${p.toFixed(numOfPlaces)}`;
}

export function createNodes(
    theme: any,
    data: any,
    gNodes: any,
    gLinks: any,
    gMarkers: any,
    tooltipRef: any,
    x: any,
    y: any,
    r: any,
    transitionProps: ITransitionProps,
    onNodeClickCallBack: any,
) {
    const { tEnter } = getTransitionsFromProps(gNodes, transitionProps);

    const divTooltip = d3.select(tooltipRef.current);

    selectAllNodeGroups(gNodes)
        .data(data.states, (d: any) => `node_${d.id}`)
        .join(
            (enter: any) => nodeEnter(enter, theme, x, y, r, tEnter),
            (update: any) => nodeUpdate(update, x, y, r),
            (exit: any) => {
                exit.remove();
                return exit;
            },
        );

    selectAllNodeGroups(gNodes).sort((a: any, b: any) => d3.descending(a.r, b.r));

    selectAllNodeGroups(gNodes)
        .on('click', function (this: any, event: any) {
            colorBlueNodeAndLinks.call(this, theme, gNodes, gLinks, gMarkers);
            onNodeClickCallBack(event, (d3.select(this).data()[0] as any).stateNo);
        })
        .on("mouseover", function (this: any, event: any, d: any) {
            //  divTooltip.style("display", "inline-block").style("opacity", 1);
            d3.select(this).style("cursor", "pointer")
        })
        .on('mousemove', (event: any, d: any) => {
            // mousemove(event, d, divTooltip)

            divTooltip.style("left", `${event.positionX}px`);
            divTooltip.style("top", `${event.positionY}px`);
            divTooltip.style("display", "inline-block");
            divTooltip.style("opacity", "0.9");
            divTooltip.html(`${d.stateNo}: ${d.suggestedLabel.label}`);

        })
        .on("mouseout", function (this: any) {
            divTooltip.style("opacity", 0);
            d3.select(this).style("cursor", "default")
        })
        .call(onNodeDrag(createNodesMap(gNodes), gLinks));
}

function mousemove(event: any, d: any, div: any) {
    div
        .html(`
            <div>
                <table>
                    <tr>
                        <th>stateNo</th>
                        <th>nMembers</th>
                        <th>x,y</th>
                        <th>Label</th>
                    </tr>
                    <tr>
                        <th>${d.stateNo}</td>
                        <th>${d.nMembers}</td>
                        <td>[${event.pageX}, ${event.pageY}]</td>
                        <td>${d.suggestedLabel.label}</td>
                    </tr>
                </table>
            </div>
        `)
        .style("left", `${(event.pageX - 3)} px`)
        .style("top", `${(event.pageY - 12)} px`);
}

function nodeEnter(selection: any, theme: any, x: any, y: any, r: any, tEnter: any) {
    const enterTmp = selection.append('g').attr('class', 'node_group').attr('opacity', 0);
    enterTmp
        .append('circle')
        .attr('class', 'node_circle')
        .attr('cx', (d: any) => scale(x, d.x))
        .attr('cy', (d: any) => scale(y, d.y))
        .attr('r', (d: any) => scale(r, d.r))
        .attr('fill', (d: any, i: any) => d.color || "grey")
        .attr('opacity', theme.state.default.opacity)

    enterTmp
        .append('text')
        .attr('class', 'node_title')
        .attr('x', (d: any) => scale(x, d.x))
        .attr('dy', (d: any) => scale(y, d.y))
        .style('fill', 'white')
        .attr('text-anchor', 'middle')
        .text((d: any) =>
            d.suggestedLabel && d.suggestedLabel.label ? d.suggestedLabel.label : '',
        );

    enterTmp
        .call((enter: any) => enter.transition(tEnter).attr('opacity', 1))
    return enterTmp;
}

function nodeUpdate(selection: any, x: any, y: any, r: any) {
    const enterTmp = selectNodeGroup(selection);
    selectNodeCircle(selection)
        .attr('cx', (d: any) => scale(x, d.x))
        .attr('cy', (d: any) => scale(y, d.y))
        .attr('r', (d: any) => scale(r, d.r))
        .attr('opacity', (d: any) => d.opacity || 1);

    selectNodeTitle(selection)
        .attr('x', (d: any) => scale(x, d.x))
        .attr('dy', (d: any) => scale(y, d.y));

    return enterTmp;
}

export function createMarkers(theme: any, data: any, gMarkers: any) {
    const markers = gMarkers
        .append('svg:defs')
        .selectAll('marker')
        .data(data.links, (d: any) => `link_s${d.source}t${d.target}`)
        .join(
            (enter: any) =>
                enter
                    .append('svg:marker')
                    .attr('id', (d: any) => `arrow_s${d.source}_t${d.target}`)
                    .attr('class', 'line_arrow')
                    .attr('viewBox', '0 -5 10 10')
                    .attr('refX', 18)
                    .attr('refY', 0)
                    .attr('markerWidth', 8)
                    .attr('markerHeight', 8)
                    .attr('orient', 'auto')
                    .attr('stroke', theme.marker.default.stroke)
                    .attr('fill', theme.marker.default.fill),
            (update: any) => update,
            (exit: any) => exit.remove(),
        );
    markers.append('svg:path').attr('d', 'M0,-5L10,0L0,5');
    return markers;
}

export function getTransitionsFromProps(g: any, props: ITransitionProps): any {
    const rez: any = {};

    Object.entries(props).forEach(([key, transition]) => {
        rez[key] = g.transition().duration(transition.duration).ease(transition.ease);
    });
    return rez;
}

function onNodeDrag(nodesMap: any, gLinks: any) {
    return d3
        .drag<SVGGElement, unknown>()
        .subject(function (event: any) { // eslint-disable-line prefer-arrow-callback
            return {
                x: event.x,
                y: event.y,
            };
        })
        .on('drag', function (this: any, event: any, d: any) {
            d.x = event.x; // eslint-disable-line no-param-reassign
            d.y = event.y; // eslint-disable-line no-param-reassign

            const nodeGroup = d3.select(this);
            selectNodeCircle(nodeGroup).attr('cx', d.x).attr('cy', d.y);
            selectNodeTitle(nodeGroup).attr('x', d.x).attr('dy', d.y);

            selectAllLinkPaths(gLinks).attr('d', (dTmp: any) => drawLineWithOffset(nodesMap, dTmp));
        });
}

function drawLineWithOffset(nodesMap: any, d: any) {
    let path = '';

    if (d != null) {
        const data = getLinkDataWithDirectionType(nodesMap, d);
        const xDiff = data.target.x - data.source.x;
        const yDiff = data.target.y - data.source.y;
        const theta = Math.atan(Math.abs(yDiff / xDiff));
        const { source, target } = data;

        if (d.linkType !== LinkType.SELF) {
            source.x += source.r * Math.cos(theta) * (xDiff > 0 ? 1 : -1);
            source.y += source.r * Math.sin(theta) * (yDiff > 0 ? 1 : -1);
            target.x -= target.r * Math.cos(theta) * (xDiff > 0 ? 1 : -1);
            target.y -= target.r * Math.sin(theta) * (yDiff > 0 ? 1 : -1);
        }
        path = createPath(data, d);
    }
    return path;
}

function colorBlueNodeAndLinks(this: any, theme: any, gNodes: any, gLinks: any, gMarkers: any): void {
    selectAllNodeGroups(gNodes).each(function (this: any) {
        selectNodeCircle(d3.select(this)).attr('stroke', 'none');
    });
    const nodeGroupClicked = d3.select(this);
    selectNodeCircle(nodeGroupClicked)
        .attr('stroke', theme.state.selected.stroke)
        .attr('stroke-width', 5)

    selectAllLinkGroups(gLinks).each(function (this: any) {
        const linkGroup = d3.select(this);
        const linePath = selectLinkPath(linkGroup);
        const lineData: any = linkGroup.data()[0];
        const arrow = gMarkers.select(`#arrow_s${lineData.source}_t${lineData.target}`);

        const delay = 150;

        if ((linkGroup.data()[0] as any).source === (nodeGroupClicked.data()[0] as any).id) {
            linePath
                .attr('stroke', theme.link.default.stroke)
                .transition()
                .ease(d3.easeExpIn)
                .duration(delay)
                .attr('stroke', theme.link.selected.stroke);

            arrow
                .attr('stroke', theme.marker.selected.stroke)
                .attr('fill', theme.marker.selected.fill)
                .transition()
                .ease(d3.easeExpIn)
                .duration(delay)
                .attr('stroke', theme.marker.selected.fill);
        } else {
            linePath.attr('stroke', theme.link.default.stroke);
            arrow.attr('stroke', theme.marker.default.stroke).attr('fill', theme.marker.default.stroke);
        }
    });
}

function createPath(data: any, link: any): string {
    let path = '';

    switch (link.linkType) {
        case LinkType.BIDIRECT: {
            const dx = data.target.x - data.source.x;
            const dy = data.target.y - data.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            path = `M ${data.source.x},${data.source.y}A${dr},${dr} 0 0,1 ${data.target.x},${data.target.y}`;
            break;
        }
        case LinkType.SELF: {
            const { x, y, r } = data.source;
            const xNew = x + r;
            const t = (x + xNew) / 2;
            const yNew = y - 5.5 * r;
            const ctx = d3.path();
            ctx.moveTo(xNew, y);
            ctx.quadraticCurveTo(t, yNew, x, y - data.source.r);
            path = ctx.toString();
            break;
        }
        case LinkType.SINGLE: {
            path = `M ${data.source.x},${data.source.y} L${data.target.x},${data.target.y}`;
            break;
        }
        default: {
            console.log('default case');
        }
    }
    return path;
}

export function getLinkDataWithDirectionType(nodesMap: any, link: any) {
    let data = null;
    const sNodeCircle = selectNodeCircle(nodesMap[link.source]);
    const tNodeCircle = selectNodeCircle(nodesMap[link.target]);
    data = {
        source: {
            x: parseFloat(sNodeCircle.attr('cx')),
            y: parseFloat(sNodeCircle.attr('cy')),
            r: parseFloat(sNodeCircle.attr('r')),
        },
        target: {
            x: parseFloat(tNodeCircle.attr('cx')),
            y: parseFloat(tNodeCircle.attr('cy')),
            r: parseFloat(tNodeCircle.attr('r')),
        },
    };
    return data;
}

export function selectAllNodeGroups(selection: any) {
    return selection.selectAll('.node_group');
}

export function selectAllNodeCircles(selection: any) {
    return selection.selectAll('.node_circle');
}

export function selectAllNodeTitles(selection: any) {
    return selection.selectAll('.node_title');
}

export function selectAllLinkGroups(selection: any) {
    return selection.selectAll('.link_group');
}

export function selectAllLinkPaths(selection: any) {
    return selection.selectAll('.link_path');
}

export function selectLinkPath(selection: any) {
    return selection.select('.link_path');
}

export function selectNodeGroup(selection: any) {
    return selection.select('.node_group');
}

export function selectNodeCircle(selection: any) {
    return selection.select('.node_circle');
}

export function selectNodeTitle(selection: any) {
    return selection.select('.node_title');
}

export function createBandScale(domain: string[], range: number[], padding: number) {
    return d3.scaleBand().domain(domain).range([range[0], range[1]]).padding(padding);
}

export function createLinearScale(domain: number[], range: number[]) {
    return d3.scaleLinear().domain(domain).range(range);
}

export function createOrdinalScale(domain: string[], range: number[]) {
    return d3.scaleOrdinal().domain(domain).range(range);
}

export function createLogScale(domain: number[], range: number[]) {
    return d3.scaleLog().domain(domain).range(range);
}

export function createPowScale(domain: number[], range: number[]) {
    return d3.scalePow().domain(domain).range(range);
}

export function xAxis(g: any, height: number, xScale: any) {
    const axis = d3.axisBottom(xScale);
    return g
        .attr('transform', `translate(0, ${height})`)
        .call(axis.tickFormat((x: any) => `${x.toFixed(2)}`));
}

export function yAxis(g: any, yScale: any, yLabel: string) {
    return g
        .call(d3.axisLeft(yScale).ticks(null, 's'))
        .call((gCurr: any) => gCurr.select('.domain').remove())
        .call((gCurr: any) =>
            gCurr
                .select('.tick:last-of-type text')
                .clone()
                .attr('x', 3)
                .attr('text-anchor', 'start')
                .attr('font-weight', 'bold')
                .text(yLabel),
        );
}

export function isValidProb(p: number, pThreshold: number) {
    return p > 0 && p >= pThreshold;
}

export function findMinMaxValues(scales: any) {
    const rez = {
        x: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
        y: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
        r: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
    };
    scales
        .map((sc: any) => sc.states)
        .flat()
        .forEach((el: any) => {
            rez.x.min = Math.min(rez.x.min, el.x);
            rez.x.max = Math.max(rez.x.max, el.x);
            rez.y.min = Math.min(rez.y.min, el.y);
            rez.y.max = Math.max(rez.y.max, el.y);
            rez.r.min = Math.min(rez.r.min, el.r);
            rez.r.max = Math.max(rez.r.max, el.r);
        });
    rez.x.min -= rez.r.max;
    rez.y.min -= rez.r.max;
    rez.x.max += rez.r.max;
    rez.y.max += rez.r.max;
    return rez;
}

export function uniqueId(state: any) {
    return `uid=${state.suggestedLabel.label}_statProb=${state.stationaryProbability}`;
}

export function pseudoUniqueId(state: any) {
    return `uid=${state.suggestedLabel.label}`;
}

export function createDictId(scales: any) {
    const dict: any = {};
    let stateId = 0;

    scales.forEach((sc: any) => {
        sc.states.forEach((state: any) => {
            const key = uniqueId(state);

            if (!dict[key]) {
                dict[key] = stateId;
                stateId += 1;
            }
        });
    });
    return dict;
}

export function createStatesDict(scales: any, dictId: any, maxRadius: number, debug: boolean) {
    const statesDict: any = {};
    const labelSet = new Set();
    scales
        .flatMap((sc: any) => sc.states)
        .forEach((state: any) => labelSet.add(state.suggestedLabel.label));

    scales.forEach((sc: any, scaleIx: number) => {
        sc.states.forEach((state: any, i: number) => {
            state.x = -1; // eslint-disable-line no-param-reassign
            state.y = -1; // eslint-disable-line no-param-reassign
            state.r = maxRadius * state.stationaryProbability; // eslint-disable-line no-param-reassign
            const key = uniqueId(state);
            const currStateId = dictId[key];

            if (sc.areTheseInitialStates) {
                const currAngle = (360 / sc.states.length) * i;
                state.x = maxRadius * Math.sin((Math.PI * 2 * currAngle) / 360) + maxRadius; // eslint-disable-line no-param-reassign
                state.y = maxRadius * Math.cos((Math.PI * 2 * currAngle) / 360) + maxRadius; // eslint-disable-line no-param-reassign
            } else if (!sc.areTheseInitialStates && !statesDict[currStateId]) {
                let xSum = 0;
                let ySum = 0;
                state.childStates.forEach((stateNo: number) => {
                    const childState = scales[scaleIx - 1].states.find(
                        (el: any) => el.stateNo === stateNo,
                    );
                    const childKey = uniqueId(childState);
                    xSum += statesDict[childKey].x;
                    ySum += statesDict[childKey].y;
                });
                state.x = xSum / state.childStates.length; // eslint-disable-line no-param-reassign
                state.y = ySum / state.childStates.length; // eslint-disable-line no-param-reassign
            }
            statesDict[key] = state;
        });
    });
    return statesDict;
}

export function createStateLinks(
    stateIx: number,
    state: any,
    sc: any,
    dictId: any,
    pThreshold: number,
) {
    const stateLinks: any[] = []

    for (let i = 0; i < state.nextStateProbDistr.length; i++) {
        const p = state.nextStateProbDistr[i];

        if (isValidProb(p, pThreshold)) {
            const sourceId = dictId[uniqueId(state)];
            const targetId = dictId[uniqueId(sc.states[i])];

            let linkType = null;

            if (sourceId === targetId) {
                linkType = LinkType.SELF;
            } else if (isValidProb(sc.states[i].nextStateProbDistr[stateIx], pThreshold)) {
                linkType = LinkType.BIDIRECT;
            } else {
                linkType = LinkType.SINGLE;
            }

            const obj = { source: sourceId, target: targetId, linkType, p, }
            stateLinks.push(obj);
        }
    }
    return stateLinks;
}

export function createGraphData(scales: any, stateDict: any, dictId: any, pThreshold: number) {
    return scales.map((sc: any) => {
        const links: any[] = [];
        const states: any[] = [];

        sc.states.forEach((state: any, stateIx: number) => {
            links.push(createStateLinks(stateIx, state, sc, dictId, pThreshold));
            states.push(stateDict[uniqueId(state)]);
        });

        return {
            states: states.map((s: any, i: number) => {
                const stateClone = JSON.parse(JSON.stringify(s));
                stateClone.id = dictId[uniqueId(sc.states[i])];
                return stateClone;
            }),
            links: links.flat(),
        };
    });
}

export function addColorsToScaleStates(scales: any) {
    const initialScaleStates = scales[0].states;
    const dict: any = {};
    let degOffset = 0;

    scales.forEach((sc: any, scaleIx: any) => {
        if (scaleIx > 0) {
            console.log(`====== ${scaleIx}`);
            sc.states.forEach((state: any) => {
                if (scaleIx === 1) {
                    const childStates = initialScaleStates.filter((initState: any) =>
                        state.childStates.includes(initState.stateNo),
                    );
                    childStates.forEach((childState: any) => {
                        const angle = 360 * childState.stationaryProbability;
                        const angleMiddle = degOffset + angle / 2;

                        dict[pseudoUniqueId(childState)] = {
                            middle: angleMiddle,
                            w: childState.stationaryProbability,
                        };
                        degOffset += angle;

                        const curr = dict[pseudoUniqueId(childState)]; // FIXME: remove curr

                        const color = generateColor(curr.middle, scaleIx, scales.length);

                        state.color = color; // eslint-disable-line no-param-reassign
                        console.log('stateNo=', state.stateNo);
                        console.log('%c color=%s', `color: ${color}`, color)
                        // console.log('color=', state.color, ', dict[pseudoUniqueId(childState)]=', dict[pseudoUniqueId(childState)]);
                        console.log("\n")
                    });
                } else {
                    const childStates = findChildStates(state, scales[scaleIx - 1]);

                    childStates.forEach((childState: any) => {
                        let w = 0;
                        let ix = 0;
                        let sum = 0;
                        const objCurr = dict[pseudoUniqueId(childState)];

                        if (objCurr) {
                            sum += objCurr.w * objCurr.middle;
                            w += objCurr.w;
                            ix += 1;
                            dict[pseudoUniqueId(state)] = { middle: sum / w, w };
                            state.color = generateColor(objCurr.middle, scaleIx, scales.length); // eslint-disable-line  no-param-reassign
                        }
                    });
                }
            });
        }

        console.log('\n');
    });
    return dict;
}

function generateColor(middle: number, scaleIx: number, nScales: number) {
    const xMin = 20;
    const xMax = 70;
    const percent = (scaleIx + 1) / nScales;
    const saturation = percent * (xMax - xMin) + xMin;
    return `hsl(${middle},${saturation}%, 50%)`;
}

function findChildStates(state: any, prevScale: any) {
    return state.childStates.map((stateNo: number) => {
        const a = 1;
        return prevScale.states.find((el: any) => el.stateNo === stateNo);
    });
}