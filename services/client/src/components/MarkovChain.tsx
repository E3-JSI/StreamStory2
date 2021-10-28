import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import {
    createSVG,
    getSVG,
    TRANSITION_PROPS,
    createLinearScale,
    createNodes,
    createLinks,
    createMarkers,
    LinkType,
    createGraphContainer,
    getGraphContainer,
    createPowScale,
    findMinMaxValues,
    isValidProb,
    uniqueId,
    createStateLinks,
    createDictId,
    createStatesDict,
    createGraphData,
} from '../utils/markovChainUtils';
import { ModelVisualizationProps } from './ModelVisualization';
import { createSlider } from '../utils/sliderUtils';

const MarkovChain = ({ model, onStateSelected }: ModelVisualizationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [debug] = useState<boolean>(false);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [currentScaleIx, setCurrentScaleIx] = useState<number>(0);
    const [maxRadius] = useState<number>(130);
    const [currScaleIx] = useState<number>(0);
    const [data, setData] = useState<any>();
    const [windowSize] = useState<any>({ width: undefined, height: undefined });

    const [pThreshold, setPThreshold] = useState<number>(0.1);
    const [sliderProbPrecision] = useState<number>(2);

    const [dictIdTmp, setDictIdTmp] = useState<number>();
    const [statesDictTmp, setStatesDictTmp] = useState<number>();

    useEffect(() => {
        if (model.model.scales && model.model.scales.length) {
            console.log('model.model.scales=', model.model.scales);

            const dictId = createDictId(model.model.scales);
            setDictIdTmp(dictId);

            const statesDict = createStatesDict(model.model.scales, dictId, maxRadius, debug);
            setStatesDictTmp(statesDict);

            const graphData = createGraphData(model.model.scales, statesDict, dictId, pThreshold);
            setData(graphData);

            calcColors(graphData);

            renderMarkovChain(graphData);
        }
    }, [model.model.scales]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (
            pThreshold >= 0 &&
            currentScaleIx >= 0 &&
            model.model.scales &&
            model.model.scales.length &&
            data &&
            data.length
        ) {
            const graphData = createGraphData(
                model.model.scales,
                statesDictTmp,
                dictIdTmp,
                pThreshold,
            );
            setData(graphData);
            renderMarkovChain(data);
        }
    }, [windowSize, pThreshold, currentScaleIx]); // eslint-disable-line react-hooks/exhaustive-deps

    function renderMarkovChain(graphData: any): void {
        console.log('start: renderMarkovChain');
        const boundary = findMinMaxValues(graphData);
        const width = containerRef?.current?.offsetWidth || 150; // FIXME: hardcoded
        const height = 700; // FIXME: hardcoded
        const margin = { top: 5, right: 5, bottom: 10, left: 10 }; // FIXME: hardcoded
        const chart = { top: 2, left: 2 }; // FIXME: hardcoded
        const xWidth = width - chart.left - margin.left - margin.right;
        const yWidth = height - chart.top - margin.top - margin.bottom;

        if (graphData && model.model.scales[currentScaleIx]) {
            let graph = null;
            let graphContainer = null;
            let gNodes = null;
            let gLinks = null;
            let gMarkers = null;
            let gSliderProb = null;
            let gSliderScale = null;

            if (!initialized) {
                graph = createSVG(containerRef, width, height, margin);
                graphContainer = createGraphContainer(graph, width, height, chart);
                graphContainer
                    .append('rect')
                    .attr('width', xWidth)
                    .attr('height', yWidth)
                    .style('fill', '#1a6048')
                    .style('opacity', '0.1')
                    .style('stroke-width', '1')
                    .style('stroke', 'white');

                gLinks = graphContainer.append('g').attr('class', 'links');
                gNodes = graphContainer.append('g').attr('class', 'nodes');
                gMarkers = graphContainer.append('g').attr('class', 'markers');
                gSliderProb = graphContainer.append('g').attr('class', 'slider_prob');
                gSliderScale = graphContainer.append('g').attr('class', 'slider_scale');
                setInitialized(true);
            } else {
                graph = getSVG(containerRef, width, height, margin);
                graphContainer = getGraphContainer(graph);
                gLinks = graphContainer.select('g.links');
                gNodes = graphContainer.select('g.nodes');
                gMarkers = graphContainer.select('g.markers');
                gSliderProb = graphContainer.select('g.slider_prob');
                gSliderScale = graphContainer.select('g.slider_scale');
            }
            const x = createLinearScale([boundary.x.min, boundary.x.max], [0, xWidth]);
            const y = createLinearScale([boundary.y.max, boundary.y.min], [yWidth, 0]);
            const r = createLinearScale(
                [boundary.r.min, boundary.r.max],
                [yWidth / 20, yWidth / 5],
            );
            const color = d3.scaleOrdinal(d3.schemeTableau10);
            const xSliderProb = createLinearScale([0, 1], [0, xWidth]).clamp(true);
            const ySliderScale = createLinearScale(
                [0, model.model.scales.length],
                [yWidth, 0],
            ).clamp(true);

            const format2Decimals = d3.format(`.${sliderProbPrecision}f`); // FIXME: move to another file
            const formatInt = d3.format('.0f'); // FIXME: move to another file

            createNodes(
                graphData[currentScaleIx],
                gNodes,
                gLinks,
                gMarkers,
                x,
                y,
                r,
                color,
                TRANSITION_PROPS,
                (a: any, b: any) => {
                    const selectedState = model.model.scales[currentScaleIx].states.find(
                        (state: any) => state.stateNo === b,
                    );
                    onStateSelected(selectedState);
                },
            );
            if (!initialized) {
                createSlider(
                    gSliderProb,
                    xSliderProb,
                    yWidth,
                    pThreshold,
                    false,
                    true,
                    true,
                    format2Decimals,
                    (p: number) => setPThreshold(p),
                );

                let prevIx = -1;
                createSlider(
                    gSliderScale,
                    ySliderScale,
                    yWidth,
                    currScaleIx,
                    true,
                    false,
                    false,
                    formatInt,
                    (val: number) => {
                        const valFloor = Math.floor(val);

                        if (valFloor !== prevIx) {
                            setCurrentScaleIx(valFloor);
                            prevIx = valFloor;
                        }
                    },
                );
            }
            createLinks(graphData[currentScaleIx], gNodes, gLinks, TRANSITION_PROPS);
            createMarkers(graphData[currentScaleIx], gMarkers);
        }
    }

    function calcColors(graphData: any) {
        console.log('start: calcColors');

        const queue: any[] = [];

        while (queue.length > 0) {
            console.log('asdasdss');
        }

        console.log('end: calcColors');
    }

    function recursion(currState: any, degOffset: number, stateIx: number, graphData: any) {
        if (currState == null) {
            return null;
        }
        if (!currState.childStates || currState.childStates.length === 0) {
            const a = 360 * currState.stationaryProbability;
            const angleMiddle = degOffset + a / 2;

            return {
                degOffset: degOffset + a,
                node: { middle: angleMiddle, w: currState.stationaryProbability },
            };
        }
        if (currState.childStates && currState.childStates.length > 0) {
            let curDegOffset = degOffset;
            let ix = 0;
            let sum = 0;
            let w = 0;
            const childStates = graphData[stateIx];

            while (ix < childStates.length) {
                const childRecRez: any = recursion(
                    childStates[ix],
                    curDegOffset,
                    stateIx + 1,
                    graphData,
                );
                curDegOffset = childRecRez.degOffset;
                sum += childRecRez.node.w * childRecRez.node.middle;
                w += childRecRez.node.w;
                ix += 1;
            }
            return { degOffset: curDegOffset, node: { w, middle: sum / w } };
        }
        return null;
    }

    return (
        <>
            <div ref={containerRef} style={{ backgroundColor: '#272b30' }} />
        </>
    );
};

export default MarkovChain;
