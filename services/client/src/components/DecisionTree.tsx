import React, { useRef, useEffect, useState } from 'react';
import { BoxProps } from '@material-ui/core';
import * as d3 from 'd3';
import { updateChart } from '../utils/decisionTreeUtils';

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
            // TODO: not elegant
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
            duration: 500,
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
            const treemap = d3.tree().size([opt.width, opt.height]);
            const source = d3.hierarchy(decisionTreeData, (d: any) => d.children) as any; // eslint-disable-line
            source.x0 = height / 2;
            source.y0 = 0;
            updateChart(gNodes, gLinks, opt, treemap, source, selectedState);
        }
    }

    return (
        <>
            <div ref={containerRef} />
        </>
    );
}
export default DecisionTree;
