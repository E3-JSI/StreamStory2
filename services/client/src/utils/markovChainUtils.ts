import React from 'react';
import * as d3 from 'd3';
import { easeQuadIn } from 'd3'
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
    margin: any) {
    const svg = d3
        .select(container.current)
        .append('svg')
        .append('g')
        .attr('class', 'graph')
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg
        .append("rect")
        .attr("class", "zoom_rect")
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr("fill", "green")
        .attr("opacity", "0.1")

    return svg;
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
        nodesMap[d.stateNo] = item;
    });
    return nodesMap;
}

function linkWidth(d: any) {
    return Math.log(6 * d.p) + 0.5;
}

export function createLinks(
    theme: any,
    data: any,
    gNodes: any,
    gLinks: any,
    x: any,
    y: any,
    transitionProps: ITransitionProps,
) {
    const { tEnter } = getTransitionsFromProps(gLinks, transitionProps);
    const linkGroups = selectAllLinkGroups(gLinks);

    const nodesMap = createNodesMap(gNodes);

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
                    .attr('stroke-width', linkWidth)
                    .attr('fill', 'none')
                    .attr('marker-end', (d: any) => `url(#arrow_s${d.source}_t${d.target})`);

                selectLinkPath(tmp).attr('d', (d: any) =>
                    drawLineWithOffset(nodesMap, d),
                );

                tmp
                    .append('text')
                    .attr('class', 'link_path_text')
                    .attr('id', (d: any) => `path_text${d.source}t${d.target}`)
                    .attr("x", function (this: any, d: any) { // eslint-disable-line prefer-arrow-callback
                        const dSource = nodesMap[d.source].data()[0];
                        const dTarget = nodesMap[d.target].data()[0];
                        const newCoords = moveObj(dSource.stateNo, dTarget.stateNo, 50);
                        return newCoords.x;
                    })
                    .attr("y", (d: any, i: number) => {
                        const dSource = nodesMap[d.source].data()[0];
                        const dTarget = nodesMap[d.target].data()[0];
                        const newCoords = moveObj(dSource.stateNo, dTarget.stateNo, 50);
                        return newCoords.y;
                    })
                    .attr('fill', theme.linkText.default.fill)
                    .attr('text-anchor', 'middle')
                    .attr('startOffset', '20%')
                    .text((d: any) => formatLinkP(d.p));

                tmp.call((entr: any) => entr.transition(entr).attr('opacity', 1));
                return tmp;
            },
            (update: any) => {
                selectLinkPath(update)
                    .attr('d', (d: any) => drawLineWithOffset(nodesMap, d)).attr('stroke', theme.link.default.stroke);

                selectLinkPathText(update)
                    .attr("x", function (this: any, d: any) { // eslint-disable-line prefer-arrow-callback
                        const dSource = nodesMap[d.source].data()[0];
                        const dTarget = nodesMap[d.target].data()[0];
                        const newCoords = moveObj(dSource.stateNo, dTarget.stateNo, 50);
                        return newCoords.x;
                    })
                    .attr("y", (d: any, i: number) => {
                        const dSource = nodesMap[d.source].data()[0];
                        const dTarget = nodesMap[d.target].data()[0];
                        const newCoords = moveObj(dSource.stateNo, dTarget.stateNo, 50);
                        return newCoords.y;
                    })
                update.call((updt: any) => updt.transition(tEnter).attr('opacity', 1));

                return update;
            },
            (exit: any) => {
                exit.remove();
                return exit;
            },
        );

    return links;
}

export function moveObj(sourceStateNo: number, targetStateNo: number, prcnt: number) {
    const path: any = document.querySelector(`#path_s${sourceStateNo}t${targetStateNo}`) // dirty bug fix- with d3.select does not work
    const pathLength = Math.floor(path.getTotalLength());
    prcnt = (prcnt * pathLength) / 100; // eslint-disable-line no-param-reassign
    // Get x and y values at a certain point in the line
    const pt = path.getPointAtLength(prcnt);
    pt.x = Math.round(pt.x);
    pt.y = Math.round(pt.y);
    return pt;
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
        .data(data.states, (d: any) => `node_${uniqueId(d)}`)
        .join(
            (enter: any) => nodeEnter(enter, theme, x, y, r, tEnter),
            (update: any) => update,
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
            d3.select(this).style("cursor", "pointer")
        })
        .on('mousemove', (event: any, d: any) => {
            divTooltip
                .style("position", "absolute")
                .style('top', `${event.pageY + 10}px`)
                .style('left', `${event.pageX + 10}px`)
                .style('background-color', 'white')
                .style('border-radius', '4px')
                .style('width', "100%")
                .style('max-width', "230px")
                .style('padding', '1.5em')
                .style("word-wrap", "break-word")
                .style("opacity", 0)
                .html(`<div style="color:black">
                <h3><span>${d.suggestedLabel.label}</span> <span>(stateNo${d.stateNo})</span></h3>
                </div>
                `)
                .transition()
                .duration(700)
                .style("opacity", "0.9")
        })
        .on("mouseout", function (this: any) {
            divTooltip.interrupt();
            divTooltip
                .transition()
                .ease(easeQuadIn)
                .duration(200)
                .style("opacity", 0);
            d3.select(this).style("cursor", "default")
        })
        .call(onNodeDrag(createNodesMap(gNodes), gLinks));
}

function nodeEnter(selection: any, theme: any, x: any, y: any, r: any, tEnter: any) {
    const enterTmp = selection.append('g').attr('class', 'node_group').attr('opacity', 0);
    enterTmp
        .append('circle')
        .attr('class', 'node_circle')
        .attr('cx', (d: any) => scale(x, d.x))
        .attr('cy', (d: any) => scale(y, d.y))
        .attr('r', (d: any) => scale(r, d.r))
        .attr('fill', (d: any) => d.color)
        .attr('opacity', theme.state.default.opacity)
        .style('filter', 'drop-shadow(0px 0px 5px rgba(0, 0, 0, .5))')

    const lineHeight = 40; // FIXME: hardcoded
    const linesDict: any = {}

    enterTmp
        .each(function (this: any) {
            const d: any = d3.select(this).data()[0];
            const lines = createLines(d.suggestedLabel.label, lineHeight);
            linesDict[uniqueId(d)] = lines;
        });

    enterTmp
        .append("text")
        .attr("class", "node_label")
        .attr("text-anchor", "middle")
        .attr("font-size", `${lineHeight}px`)
        .style('fill', theme.stateText.default.fill)
        .attr(
            "transform", (d: any, i: number) => `translate(${scale(x, d.x)},${scale(y, d.y)}) scale(${scale(r, d.r) / scale(r, textRadius(linesDict[uniqueId(d)], lineHeight))})`)
        .selectAll("tspan")
        .data((d: any) => linesDict[uniqueId(d)])
        .enter()
        .append("tspan")
        .attr("x", 0)
        .attr("y", (d: any, i: number, lines: any[]) => (i - lines.length / 2 + 0.8) * lineHeight)
        .text((d: any) => d.text);

    enterTmp
        .call((enter: any) => enter.transition(tEnter).attr('opacity', 1))
    return enterTmp;
}

function textRadius(lines: any[], lineHeight: number) {
    let radius = 0;

    if (lines && lines.length && lineHeight) {
        for (let i = 0, n = lines.length; i < n; ++i) {
            const dy = (Math.abs(i - n / 2 + 0.5) + 0.5) * lineHeight;
            const dx = lines[i].width / 2;
            radius = Math.max(radius, Math.sqrt(dx ** 2 + dy ** 2));
        }
    }
    return radius;
}

function createWords(text: string) {
    const words = text.split(/\s+/g);
    if (!words[words.length - 1]) words.pop();
    if (!words[0]) words.shift();
    return words;
}

function createLines(text: any, lineHeight: number) {
    const words: any[] = createWords(text.trim())
    const targetWidth = Math.sqrt(measureWidth(text.trim()) * lineHeight);
    let line: any;
    let lineWidth0 = Infinity;
    const lines = [];

    for (let i = 0, n = words.length; i < n; ++i) {
        const first = (line ? `${line.text} ` : "");
        const lineText1 = `${first}${words[i]}` // (line ? line.text + " " : "") + words[i];
        const lineWidth1 = measureWidth(lineText1);

        if ((lineWidth0 + lineWidth1) / 2 < targetWidth) {
            line.width = lineWidth0 = lineWidth1; // eslint-disable-line no-multi-assign
            line.text = lineText1;
        }
        else {
            lineWidth0 = measureWidth(words[i]);
            line = { width: lineWidth0, text: words[i] };
            lines.push(line);
        }
    }
    return lines;
}

function measureWidth(text: string) {
    const ctx: any = document.createElement("canvas").getContext("2d");
    return ctx.measureText(text).width;
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
                    .attr('refX', 10)
                    .attr('refY', 0)
                    .attr('markerWidth', 8)
                    .attr('markerHeight', 8)
                    .attr('orient', 'auto')
                    .attr('stroke', theme.marker.default.stroke)
                    .attr('fill', theme.marker.default.fill),
            (update: any) => update.select(".line_arrow")
                .attr('stroke', theme.marker.default.stroke)
                .attr('fill', theme.marker.default.fill)
            ,
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
        .subject((event: any) => ({ x: event.x, y: event.y }))
        .on('drag', function (this: any, event: any, d: any) {
            const nodeGroup = d3.select(this).raise();
            selectNodeCircle(nodeGroup).attr('cx', event.x).attr('cy', event.y);
            const transform = selectNodeLabel(nodeGroup).attr("transform");
            const scaleIx = transform.indexOf("scale")
            const scaleStr = transform.substring(scaleIx, transform.length)
            selectNodeLabel(nodeGroup).attr("transform", `translate(${event.x}, ${event.y}) ${scaleStr}`)
            selectAllLinkPaths(gLinks).attr('d', (dTmp: any) => drawLineWithOffset(nodesMap, dTmp));
            selectAllLinkPathText(gLinks)
                .attr("x", function (this: any, dCurr: any) { // eslint-disable-line prefer-arrow-callback
                    const dSource = nodesMap[dCurr.source].data()[0];
                    const dTarget = nodesMap[dCurr.target].data()[0];
                    const newCoords = moveObj(dSource.stateNo, dTarget.stateNo, 50);
                    return newCoords.x;
                })
                .attr("y", (dCurr: any, i: number) => {
                    const dSource = nodesMap[dCurr.source].data()[0];
                    const dTarget = nodesMap[dCurr.target].data()[0];
                    const newCoords = moveObj(dSource.stateNo, dTarget.stateNo, 50);
                    return newCoords.y;
                })
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

        if ((linkGroup.data()[0] as any).source === (nodeGroupClicked.data()[0] as any).stateNo) {
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
            const yNew = y - 3.5 * r;
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

export function selectLinkPathText(selection: any) {
    return selection.select('.link_path_text');
}

export function selectAllLinkPathText(selection: any) {
    return selection.selectAll('.link_path_text');
}

export function selectNodeGroup(selection: any) {
    return selection.select('.node_group');
}

export function selectNodeCircle(selection: any) {
    return selection.select('.node_circle');
}

export function selectNodeLabel(selection: any) {
    return selection.select('.node_label');
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
    return rez;
}

export function uniqueId(state: any) {
    return `uid=${state.suggestedLabel.label}_statProb=${state.stationaryProbability}`;
}

export function uniqueIdScale(state: any, scaleIx: number) {
    return `uid=${state.suggestedLabel.label}_scaleIx=${scaleIx}`;
}

export function pseudoUniqueId(state: any) {
    return `uid=${state.suggestedLabel.label}`;
}

export function createStateLinks(
    stateIx: number,
    state: any,
    sc: any,
    pThreshold: number,
) {
    const stateLinks: any[] = []

    for (let i = 0; i < state.nextStateProbDistr.length; i++) {
        const p = state.nextStateProbDistr[i];

        if (isValidProb(p, pThreshold)) {
            const sourceId = state.stateNo;
            const targetId = sc.states[i].stateNo

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

export function createGraphData(scales: any, pThreshold: number) {
    return scales.map((sc: any, scaleIx: number) => {
        const links: any[] = [];
        const states: any[] = [];
        sc.states.forEach((state: any, stateIx: number) => {
            links.push(createStateLinks(stateIx, state, sc, pThreshold));
            states.push(state);
        });
        return { states, links: links.flat() };
    });
}

export function addColorsToScaleStates(scales: any) {
    const dict: any = {};
    const colorDict: any = {}
    let degOffset = 0;

    scales.forEach((sc: any, scaleIx: any) => {
        if (scaleIx > 0) {
            sc.states.forEach((state: any) => {
                const childStates = findChildStates(state, scales[scaleIx - 1]);

                if (scaleIx === 1) {
                    childStates.forEach((childState: any) => {
                        const angle = 360 * childState.stationaryProbability;
                        const angleMiddle = degOffset + angle / 2;
                        dict[pseudoUniqueId(childState)] = { middle: angleMiddle, w: childState.stationaryProbability };
                        colorDict[pseudoUniqueId(childState)] = generateColor(dict[pseudoUniqueId(childState)].middle, scaleIx - 1, scales.length);
                        degOffset += angle;
                    });
                } else {
                    childStates.forEach((childState: any) => {
                        let w = 0;
                        let ix = 0;
                        let sum = 0;
                        const objCurr = dict[pseudoUniqueId(childState)];

                        if (objCurr) {
                            sum += objCurr.w * objCurr.middle;
                            w += objCurr.w;
                            ix += 1;
                            dict[pseudoUniqueId(childState)] = { middle: sum / w, w };
                            const color = generateColor(objCurr.middle, scaleIx - 1, scales.length); // eslint-disable-line  no-param-reassign
                            colorDict[pseudoUniqueId(childState)] = color;
                        }
                        dict[pseudoUniqueId(state)] = { middle: sum / w, w };
                    });
                }
            });
        }
    });
    // color added to each state, if added before same state in diff scale would have diff color
    scales
        .map((sc: any) => sc.states).flat()
        .forEach((state: any) => {
            state.color = colorDict[pseudoUniqueId(state)]; // eslint-disable-line no-param-reassign
        });
}

function generateColor(middle: number, scaleIx: number, nScales: number) {
    const xMin = 20; // FIXME: hardcoded
    const xMax = 70;  // FIXME: hardcoded
    const percent = 1 - ((scaleIx + 1) / nScales);
    const saturation = percent * (xMax - xMin) + xMin;
    return `hsl(${middle}, ${saturation}%, 50%)`;
}

function findChildStates(state: any, prevScale: any) {
    return state.childStates.map((stateNo: number) => {
        const a = 1;
        return prevScale.states.find((el: any) => el.stateNo === stateNo);
    });
}