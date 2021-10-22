import React from 'react';
import * as d3 from "d3";
import { easeLinear, easeQuad } from "d3";

const LINE_COLOR = "#a0a0a0";
const NODE_BORDER_COLOR = LINE_COLOR;
const LINE_SELECTED_COLOR = "#337ab7";
const NODE_SELECTED_BORDER_COLOR = LINE_SELECTED_COLOR;

export enum LinkType {
    BIDIRECT = "bidirect",
    SELF = "self",
    SINGLE = "single",
}

export const TRANSITION_PROPS: ITransitionProps = {
    tEnter: {
        duration: 300,
        ease: easeLinear,
    } as ITransition,
    tExit: {
        duration: 150,
        ease: easeQuad,
    } as ITransition
} as ITransitionProps;



export interface ITransitionProps {
    tEnter: ITransition;
    tUpdate: ITransition;
    tExit: ITransition;
}

export interface ITransition {
    duration: number;
    ease: any;
}

export function scale(s: any, value: any) {
    return s(value);
}

export function createMatrix(g: any, width: number, height: number, chart: any) {
    return g
        .append("g")
        .attr("class", "matrix")
        .attr("width", width - chart.left)
        .attr("height", height - chart.top)
        .attr("transform", `translate(${chart.left}, ${chart.top})`);
}

export function getMatrix(svg: any) {
    return svg.select("g.matrix");
}

export function calculate(deepth: number, maxDeepth: number, cIx: any, cluster: any, numOfClustersInDeepth: any, radius: number) {

    const clusterClone = JSON.parse(JSON.stringify(cluster));


    if ((deepth === maxDeepth) || (!clusterClone.hasChildren())) {
        const currAngle = (360 / numOfClustersInDeepth(deepth)) * cIx;
        clusterClone.x = (radius * Math.sin(Math.PI * 2 * currAngle / 360) + radius);
        clusterClone.y = (radius * Math.cos(Math.PI * 2 * currAngle / 360) + radius);
        clusterClone.radius = radius;
    } else if (clusterClone.hasChildren()) {
        let xSum = 0.0;
        let ySum = 0.0;
        let nonNullChildren = 0;

        clusterClone.getChildClusters().forEach((childCluster: any) => {
            if (childCluster != null) {
                xSum += childCluster.x;
                ySum += childCluster.y;
                nonNullChildren += 1;
            }
        });
        clusterClone.x = xSum / nonNullChildren;
        clusterClone.y = ySum / nonNullChildren;
        clusterClone.radius = radius;
    }
    return clusterClone;
}

export function drawLinksWihNodes(data: any, gNodes: any, gLinks: any, gMarkers: any, x: any, y: any, r: any, color: any,
    transitionProps: ITransitionProps, onNodeClickCallBack: any) {
    createNodes(data, gNodes, gLinks, gMarkers, x, y, r, color, transitionProps, onNodeClickCallBack);
    createLinks(data, gNodes, gLinks, transitionProps);
    createMarkers(data, gMarkers);
}

export function createSVG(container: React.MutableRefObject<any>, width: number, height: number, margin: any) {
    return d3
        .select(container.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("class", "graph")
        .attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

export function getSVG(container: React.MutableRefObject<any>, width: number, height: number, margin: any) {
    const svg = d3.select(container.current).select("svg");
    svg.attr("width", width).attr("height", height);

    const g = svg.select("g.graph");
    g.attr("width", width - margin.left - margin.right)
        .attr("height", height - margin.top - margin.bottom)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
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

export function createLinks(data: any, gNodes: any, gLinks: any, transitionProps: ITransitionProps) {
    const { tEnter } = getTransitionsFromProps(gLinks, transitionProps);
    const linkGroups = selectAllLinkGroups(gLinks);

    const links = linkGroups
        .data(data.links, (d: any) => `link_s${d.source}t${d.target}`)
        .join(
            (enter: any) => {
                const tmp = enter
                    .append("g")
                    .attr("class", "link_group")
                    .attr("id", (d: any) => `link_s${d.source}t${d.target}`)
                    .attr("opacity", 0)

                tmp
                    .append("path")
                    .attr("class", "link_path")
                    .attr("id", (d: any, i: number) => `path_s${d.source}t${d.target}`)
                    .attr("stroke", LINE_COLOR)
                    .attr("stroke-width", (d: any) => Math.log(5 * d.p))
                    .attr("fill", "none")
                    .attr('marker-end', (d: any) => `url(#arrow_s${d.source}_t${d.target})`)

                selectLinkPath(tmp)
                    .attr("d", (d: any) => drawLineWithOffset(createNodesMap(gNodes), d))
                tmp
                    .call(
                        (entr: any) => entr.transition(entr).attr("opacity", 1)
                    )
                return tmp;
            },
            (update: any) => {
                selectLinkPath(update)
                    .attr("d", (d: any) => drawLineWithOffset(createNodesMap(gNodes), d))

                update
                    .call(
                        (updt: any) => updt.transition(tEnter).attr("opacity", 1),
                    )

                return update;
            },
            (exit: any) => {
                exit.remove();
                return exit
            }
        )
    links.append("text")
        .attr("fill", "white")
        .append("textPath")
        .attr("class", "textpath")
        .attr("text-anchor", "middle")
        .attr("startOffset", "20%")
        .attr("xlink:href", (d: any, i: any) => `#path_s${d.source}t${d.target}`)
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
        }
        else if (startCount && (pStr[i] === '0')) {
            zerosCount += 1;
        }
        else if (startCount && (pStr[i] !== '0')) {
            break;
        }
    }
    const numOfPlaces = (zerosCount === 0) ? 2 : (zerosCount + 2);
    return `${p.toFixed(numOfPlaces)}`;
}

export function createNodes(data: any, gNodes: any, gLinks: any, gMarkers: any, x: any, y: any, r: any, color: any,
    transitionProps: ITransitionProps, onNodeClickCallBack: any) {

    const { tEnter } = getTransitionsFromProps(gNodes, transitionProps);

    selectAllNodeGroups(gNodes)
        .data(data.nodes, (d: any) => `node_${d.id}`)
        .join(
            (enter: any) => nodeEnter(enter, gNodes, gLinks, gMarkers, x, y, r, color, tEnter, onNodeClickCallBack),
            (update: any) => nodeUpdate(update, gNodes, gLinks, gMarkers, x, y, r, tEnter),
            (exit: any) => {
                exit.remove();
                return exit;
            }
        );
}

function nodeEnter(selection: any, gNodes: any, gLinks: any, gMarkers: any, x: any, y: any, r: any, color: any, tEnter: any,
    onNodeClickCallBack: any) {

    const enterTmp = selection
        .append("g")
        .attr("class", "node_group")
        .attr("opacity", 0)
    enterTmp
        .append("circle")
        .attr("class", "node_circle")
        .attr("cx", (d: any) => scale(x, d.x))
        .attr("cy", (d: any) => scale(y, d.y))
        .attr("r", (d: any) => scale(r, d.r))
        .attr("fill", (d: any, i: any) => color(i))
        .attr("stroke", NODE_BORDER_COLOR)
        .attr("stroke-width", (d: any) => circleBorderWidth(d))

    enterTmp.append("text")
        .attr("class", "node_title")
        .attr("x", (d: any) => scale(x, d.x))
        .attr("dy", (d: any) => scale(y, d.y))
        .style("fill", "white")
        .attr("text-anchor", "middle")
        .text((d: any) => d.name ? d.name : d.autoName);

    enterTmp
        .call((enter: any) => enter.transition(tEnter).attr("opacity", 1))
        .call(function (this: any) {
            onNodeDrag.call(this, createNodesMap(gNodes), gLinks)
        })
        .on("click", function (this: any, event: any) {
            colorBlueNodeAndLinks.call(this, gNodes, gLinks, gMarkers);
            onNodeClickCallBack(event, (d3.select(this).data()[0] as any).id);
        })
    // .on("mouseup", () => {
    //     console.log("mouseUp")
    // });
    return enterTmp;
}

function nodeUpdate(selection: any, gNodes: any, gLinks: any, gMarkers: any, x: any, y: any, r: any, tEnter: any) {
    const enterTmp = selectNodeGroup(selection)

    selectNodeCircle(selection)
        .attr("cx", (d: any) => scale(x, d.x))
        .attr("cy", (d: any) => scale(y, d.y))
        .attr("r", (d: any) => scale(r, d.r));

    selectNodeTitle(selection)
        .attr("x", (d: any) => scale(x, d.x))
        .attr("dy", (d: any) => scale(y, d.y));

    enterTmp
        .call((enter: any) => enter.transition(tEnter).attr("opacity", 1))
        .call(function (this: any) {
            onNodeDrag.call(this, createNodesMap(gNodes), gLinks)
        })
        .on("click", function (this: any) {
            colorBlueNodeAndLinks.call(this, gNodes, gLinks, gMarkers)
        });
    return enterTmp;
}

export function createMarkers(data: any, gMarkers: any) {
    const markers =
        gMarkers
            .append("svg:defs")
            .selectAll("marker")
            .data(data.links, (d: any) => `link_s${d.source}t${d.target}`)
            .join(
                (enter: any) => enter.append("svg:marker")
                    .attr("id", (d: any) => `arrow_s${d.source}_t${d.target}`)
                    .attr("class", "line_arrow")
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 18)
                    .attr("refY", 0)
                    .attr("markerWidth", 8)
                    .attr("markerHeight", 8)
                    .attr("orient", "auto")
                    .attr("stroke", LINE_COLOR)
                    .attr("fill", LINE_COLOR),
                (update: any) => update,
                (exit: any) => exit.remove()
            )
    markers
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
    return markers;
}

export function getTransitionsFromProps(g: any, props: ITransitionProps): any {
    const rez: any = {};

    Object.entries(props).forEach(([key, transition]) => {
        rez[key] = g.transition()
            .duration(transition.duration)
            .ease(transition.ease);
    });
    return rez;
}

function onNodeDrag(nodesMap: any, gLinks: any) {
    return d3.drag<SVGGElement, unknown>()
        .subject(function (event: any) { // eslint-disable-line prefer-arrow-callback
            return {
                x: event.x,
                y: event.y
            };
        })
        .on("drag", function (event: any, d: any) {
            d.x = event.x // eslint-disable-line no-param-reassign
            d.y = event.y; // eslint-disable-line no-param-reassign

            const nodeGroup = d3.select(this);
            selectNodeCircle(nodeGroup)
                .attr("cx", d.x)
                .attr("cy", d.y);
            selectNodeTitle(nodeGroup)
                .attr("x", d.x)
                .attr("dy", d.y)

            selectAllLinkPaths(gLinks)
                .attr("d", (dTmp: any) => drawLineWithOffset(nodesMap, dTmp))
        });
}

function drawLineWithOffset(nodesMap: any, d: any) {
    let path = "";

    if (d != null) {
        const data = getLinkDataWithDirectionType(nodesMap, d)
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

function colorBlueNodeAndLinks(this: any, gNodes: any, gLinks: any, gMarkers: any): void {
    selectAllNodeGroups(gNodes).each(function (this: any) {
        selectNodeCircle(d3.select(this))
            .attr("stroke", NODE_BORDER_COLOR)
    });
    const nodeGroupClicked = d3.select(this);


    const nodeCircle = selectNodeCircle(nodeGroupClicked);

    nodeCircle
        .attr("stroke", NODE_SELECTED_BORDER_COLOR)

    const bbox = nodeCircle.node().getBBox()

    // console.log("bbox:")
    // console.log(bbox)

    selectAllLinkGroups(gLinks).each(function (this: any) {
        const linkGroup = d3.select(this);
        const linePath = selectLinkPath(linkGroup);
        const lineData: any = linkGroup.data()[0];
        const arrow = gMarkers.select(`#arrow_s${lineData.source}_t${lineData.target}`);

        const delay = 150;

        if ((linkGroup.data()[0] as any).source === (nodeGroupClicked.data()[0] as any).id) {
            linePath
                .attr("stroke", LINE_COLOR)
                .transition()
                .ease(d3.easeExpIn)
                .duration(delay)
                .attr("stroke", LINE_SELECTED_COLOR)

            arrow
                .attr("stroke", LINE_SELECTED_COLOR)
                .attr("fill", LINE_SELECTED_COLOR)
                .transition()
                .ease(d3.easeExpIn)
                .duration(delay)
                .attr("stroke", LINE_SELECTED_COLOR)

        } else {
            linePath
                .attr("stroke", LINE_COLOR)
            arrow
                .attr("stroke", LINE_COLOR)
                .attr("fill", LINE_COLOR);
        }
    });
}

function linkBorderWidth(d: any) {
    console.log(d)
    return 5 * d.p + 0.1;
}


function circleBorderWidth(d: any) {
    return 5
}

function createPath(data: any, link: any): string {
    let path = "";

    switch (link.linkType) {
        case LinkType.BIDIRECT: {
            const dx = data.target.x - data.source.x;
            const dy = data.target.y - data.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            path = `M ${data.source.x},${data.source.y}A${dr},${dr} 0 0,1 ${data.target.x},${data.target.y}`
            break;
        }
        case LinkType.SELF: {
            const { x, y, r } = data.source;
            const xNew = x + r
            const t = (x + xNew) / 2
            const yNew = y - 5.5 * r;
            const ctx = d3.path();
            ctx.moveTo(xNew, y);
            ctx.quadraticCurveTo(t, yNew, x, y - data.source.r);
            path = ctx.toString()
            break;
        }
        case LinkType.SINGLE: {
            path = `M ${data.source.x},${data.source.y} L${data.target.x},${data.target.y}`
            break;
        }
        default: {
            console.log("default case")
        }
    }
    return path;
}

export function getLinkDataWithDirectionType(nodesMap: any, link: any) {
    let data = null;
    const sNodeCircle = selectNodeCircle(nodesMap[link.source]);
    const tNodeCircle = selectNodeCircle(nodesMap[link.target]);
    data = {
        source: { x: parseFloat(sNodeCircle.attr("cx")), y: parseFloat(sNodeCircle.attr("cy")), r: parseFloat(sNodeCircle.attr("r")) },
        target: { x: parseFloat(tNodeCircle.attr("cx")), y: parseFloat(tNodeCircle.attr("cy")), r: parseFloat(tNodeCircle.attr("r")) },
    }
    return data;
}

export function selectAllNodeGroups(selection: any) {
    return selection.selectAll(".node_group");
}

export function selectAllNodeCircles(selection: any) {
    return selection.selectAll(".node_circle");
}

export function selectAllNodeTitles(selection: any) {
    return selection.selectAll(".node_title");
}

export function selectAllLinkGroups(selection: any) {
    return selection.selectAll(".link_group");
}

export function selectAllLinkPaths(selection: any) {
    return selection.selectAll(".link_path");
}

export function selectLinkPath(selection: any) {
    return selection.select(".link_path");
}

export function selectNodeGroup(selection: any) {
    return selection.select(".node_group");
}

export function selectNodeCircle(selection: any) {
    return selection.select(".node_circle");
}

export function selectNodeTitle(selection: any) {
    return selection.select(".node_title");
}

export function findMinMaxValues(dataLevels: any[]) {
    const rez = {
        x: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
        y: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
        r: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER }
    }

    dataLevels.forEach((level: any) => {
        level.nodes.forEach((node: any) => {
            rez.x.min = Math.min(rez.x.min, node.x)
            rez.x.max = Math.max(rez.x.max, node.x)
            rez.y.min = Math.min(rez.y.min, node.y)
            rez.y.max = Math.max(rez.y.max, node.y)
            rez.r.min = Math.min(rez.r.min, node.radius)
            rez.r.max = Math.max(rez.r.max, node.radius)
        });
    });
    return rez;
}

export function createBandScale(domain: string[], range: number[], padding: number) {
    return d3
        .scaleBand()
        .domain(domain)
        .range([range[0], range[1]])
        .padding(padding);
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

export function xAxis(g: any, height: number, xScale: any) {
    const axis = d3.axisBottom(xScale)
    return g.attr("transform", `translate(0, ${height})`).call(axis.tickFormat((x: any) => `${x.toFixed(2)}`));
}

export function yAxis(g: any, yScale: any, yLabel: string) {
    return g
        .call(d3.axisLeft(yScale).ticks(null, "s"))
        .call((gCurr: any) => gCurr.select(".domain").remove())
        .call((gCurr: any) =>
            gCurr
                .select(".tick:last-of-type text")
                .clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(yLabel)
        );
}