import React, { useRef, useEffect, useState } from 'react';
import { BoxProps } from '@material-ui/core';
import * as d3 from 'd3';

export interface DecisionTreeProps extends BoxProps {
    selectedState: any; // eslint-disable-line
    commonStateData: any; // eslint-disable-line
}

export interface ChartDim {
    width?: number;
    height?: number;
}

function DecisionTree({ selectedState, commonStateData }: DecisionTreeProps): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);
    const [windowSize] = useState<ChartDim>({
        width: undefined,
        height: undefined,
    });
    const [initialized, setInitialized] = useState<boolean>();

    useEffect(() => {
        if (selectedState && commonStateData) {
            const key = selectedState.initialStates.toString();
            const data = commonStateData[key];

            if (data && data.decisionTree) {
                plotDecisionTree(data.decisionTree);
            }
        }
    }, [selectedState, commonStateData, windowSize]); // eslint-disable-line react-hooks/exhaustive-deps

    function plotDecisionTree(decisionTreeData: any) {
        const opt = {
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            },
            width: containerRef?.current?.offsetWidth || 150,
            height: 389,
            node: {
                width: 90,
                height: 40,
            },
            link: {
                maxWidth: 8,
                minWidth: 2,
            },
            char_to_pxl: 6,
            depth: 70,
        };

        const classNames = {
            decisionTree: 'decision-tree',
            hover: 'hover',
            predictionPanel: 'prediction-panel',
        };

        const width = opt.width + opt.margin.right + opt.margin.left;
        const height = opt.height + opt.margin.top + opt.margin.bottom;
        let container = null;
        let graph = null;
        let gLinks = null;
        let gNodes = null;

        if (!initialized) {
            container = d3.select(containerRef.current);
            graph = container
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', classNames.decisionTree)
                .append('svg:g')
                .attr('transform', `translate(${opt.margin.left}, ${opt.margin.top})`);
            gLinks = graph.append('g').attr('class', 'links');
            gNodes = graph.append('g').attr('class', 'nodes');
            setInitialized(true);
        } else {
            container = d3.select(containerRef.current);
            graph = container.select(`.${classNames.decisionTree}`);
            gLinks = graph.select('g.links');
            gNodes = graph.select('g.nodes');
        }
        if (decisionTreeData) {
            updateChart(gNodes, gLinks, opt, decisionTreeData, selectedState, height);
        }
    }

    function updateChart(gNodes: any, gLinks: any, opt: any, data: any, state: any, height: any) {
        const duration = 500;
        const treemap = d3.tree().size([opt.width, opt.height]);
        const source: any = d3.hierarchy(data, (d: any) => d.children);
        source.x0 = height / 2;
        source.y0 = 0;

        const treeData = treemap(source);
        const nodes = treeData.descendants();
        const links = treeData.links();
        const nSamples = source.data.nPos + source.data.nNeg;

        const linkStrokeScale = d3
            .scaleSqrt()
            .domain([0, nSamples])
            .range([opt.link.minWidth, opt.link.maxWidth]);

        nodes.forEach((d: any) => {
            d.y = d.depth * opt.depth; // eslint-disable-line
        });

        // Update the nodes…

        const node = gNodes.selectAll('g.node').data(nodes, (d: any) => {
            const posNeg = `${d.data.nPos}_${d.data.nNeg}`;
            const id = `stateNo_${state.stateNo}_posNeg_${posNeg}_init_st_${
                state.initialStates
            }_l_${nodeLabel(d)}`;
            return id;
        });

        node.join(
            (enter: any) => {
                const enterTmp = enter;
                const nodeEnter = enterTmp
                    .append('g')
                    .attr('class', 'node')
                    .attr('id', (d: any) => `n_${d.id}`)
                    .classed('leaf', (d: any) => !d.data.hasOwnProperty('splitAttr')) // eslint-disable-line
                    .attr('transform', () => `translate(${source.x0},${source.y0})`);
                nodeEnter
                    .append('rect')
                    .attr('width', 133 + 8)
                    .attr('height', 70)
                    .attr('x', (d: any) => {
                        const label = nodeLabel(d);
                        const textLen = label.length * opt.char_to_pxl;
                        const width = d3.max([opt.node.width, textLen]);
                        return -width / 2;
                    })
                    .attr('rx', 6)
                    .attr('ry', 6)
                    .style('fill', 'rgb(168,168,168)')
                    .style('filter', 'drop-shadow(0px 0px 5px rgba(0, 0, 0, .5))');
                nodeEnter
                    .append('text')
                    .attr('dy', '32px')
                    .attr('text-anchor', 'middle')
                    .text((d: any) => nodeLabel(d))
                    .style('fill-opacity', 1e-6)
                    .style('filter', 'drop-shadow(0px 0px 5px rgba(0, 0, 0, .5))')
                    .style('fill', 'white');
                // Transition nodes to their new position.
                const nodeUpdate = nodeEnter
                    .transition()
                    .duration(duration)
                    .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
                nodeUpdate
                    .select('rect')
                    .attr('width', (d: any) => {
                        const label = nodeLabel(d);
                        const textLen = label.length * opt.char_to_pxl;
                        const width = d3.max([opt.node.width, textLen]);
                        return width;
                    })
                    .attr('height', opt.node.height);

                nodeUpdate.select('text').style('fill-opacity', 1);
                const color = d3.scaleOrdinal().range(d3.schemeSet2);
                const pie = d3.pie().value((d: any) => d[1]);
                const arcGenerator = d3.arc().innerRadius(0).outerRadius(20);
                nodeEnter
                    .selectAll('mySlices')
                    .data((d: any) =>
                        pie(Object.entries({ pos: d.data.nPos, neg: d.data.nNeg }) as any),
                    )
                    .join('path')
                    .attr('d', arcGenerator)
                    .attr('fill', (d: any) => color(d.data[0]))
                    .attr('stroke', 'black')
                    .style('stroke-width', '2px')
                    .style('opacity', 0.7);
                return nodeEnter;
            },
            (update: any) => {
                const updateTmp = update;
                updateTmp
                    .select('rect')
                    .attr('width', (d: any) => {
                        const label = nodeLabel(d);
                        const textLen = label.length * opt.char_to_pxl;
                        const width = d3.max([opt.node.width, textLen]);
                        return width;
                    })
                    .attr('height', opt.node.height);
                return updateTmp;
            },
            (exit: any) => {
                const exitTmp = exit;
                const nodeExit = exitTmp
                    .transition()
                    .duration(duration)
                    .attr('transform', () => `translate(${source.x}, ${source.y})`)
                    .remove();
                nodeExit.select('rect').attr('width', 1e-6).attr('height', 1e-6);
                nodeExit.select('text').style('fill-opacity', 1e-6);
                return nodeExit;
            },
        );
        // Update the links
        const link = gLinks.selectAll('path.link').data(links, (d: any) => {
            const sourcePosNeg = `${d.source.data.nPos}_${d.source.data.nNeg}`;
            const targetPosNeg = `${d.target.data.nPos}_${d.target.data.nNeg}`;
            const id = `stateNo_${state.stateNo}_init_st_${
                state.initialStates
            }_sourcePosNeg_${sourcePosNeg}_targetPosNeg=${targetPosNeg}_s_${nodeLabel(
                d.source,
            )}_t_${nodeLabel(d.target)}`;
            return id;
        });

        link.join(
            (enter: any) => {
                const enterTmp = enter;
                // Enter any new links at the parent's previous position.
                const linkRez = enterTmp
                    .insert('svg:path', 'g')
                    .attr('class', 'link')
                    .attr('d', () => {
                        const o = { x: source.x0, y: source.y0 };
                        return diagonal({ source: o, target: o });
                    })
                    .transition()
                    .duration(duration)
                    .attr('d', diagonal)
                    .attr('fill', 'none')
                    .attr('stroke', 'rgb(112,112,112)')
                    .attr('transition', '0.2s ease-in-out')
                    .style('stroke-width', (d: any) => {
                        const n = d.target.data.nPos + d.target.data.nNeg;
                        return `${linkStrokeScale(n)}`;
                    });

                // Transition links to their new position.
                linkRez
                    .transition()
                    .duration(duration)
                    .attr('d', diagonal)
                    .style('stroke-width', (d: any) => {
                        const n = d.target.data.nPos + d.target.data.nNeg;
                        return `${linkStrokeScale(n)}`;
                    });

                return linkRez;
            },
            (update: any) => {
                const updateTmp = update;

                updateTmp.select('.link').attr('d', (d: any) => diagonal(d));

                return updateTmp;
            },
            (exit: any) => exit.remove(),
        );
    }

    function diagonal(data: any) {
        return d3
            .linkHorizontal()
            .x((d: any) => d.x)
            .y((d: any) => d.y)(data);
    }

    function nodeLabel(d: any) {
        return d.data.hasOwnProperty('splitLabel') // eslint-disable-line
            ? `${d.parent.data.splitAttr} ${d.data.splitLabel}`
            : d.data.splitAttr;
    }

    return (
        <>
            <div ref={containerRef} />
        </>
    );
}
export default DecisionTree;
