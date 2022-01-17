import React from 'react';
import * as d3 from 'd3';

export function updateChart(
    gNodes: any,
    gLinks: any,
    opt: any,
    treemap: any,
    source: any,
    state: any,
) {
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
                    if (label && label.length) {
                        const textLen = label.length * opt.char_to_pxl;
                        const width = d3.max([opt.node.width, textLen]);
                        return -width / 2;
                    }
                    console.log('Could not create label for d=', d);
                    return 0;
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
                .duration(opt.duration)
                .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
            nodeUpdate
                .select('rect')
                .attr('width', (d: any) => {
                    const label = nodeLabel(d);
                    if (label && label.length) {
                        const textLen = label.length * opt.char_to_pxl;
                        const width = d3.max([opt.node.width, textLen]);
                        return width;
                    }
                    console.log('Could not create label for d=', d);
                    return 0;
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
                .duration(opt.duration)
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
                .duration(opt.duration)
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
                .duration(opt.duration)
                .attr('d', diagonal)
                .style(
                    'stroke-width',
                    (d: any) => `${linkStrokeScale(d.target.data.nPos + d.target.data.nNeg)}`, // eslint-disable-line
                );

            return linkRez;
        },
        (update: any) => {
            const updateTmp = update;

            updateTmp.select('.link').attr('d', (d: any) => diagonal(d));

            return updateTmp;
        },
        (exit: any) => exit.remove(), // eslint-disable-line
    );
}

export function diagonal(data: any) {
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
