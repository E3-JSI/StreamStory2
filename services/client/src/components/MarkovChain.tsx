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
    createGraphContainer,
    getGraphContainer,
    findMinMaxValues,
    createDictId,
    createStatesDict,
    createGraphData,
    pseudoUniqueId,
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

            addColorsToScaleStates(model.model.scales);
            const dictId = createDictId(model.model.scales);
            setDictIdTmp(dictId);

            const statesDict = createStatesDict(model.model.scales, dictId, maxRadius, debug);
            setStatesDictTmp(statesDict);

            const graphData = createGraphData(model.model.scales, statesDict, dictId, pThreshold);
            setData(graphData);

            const degOffset = 0;
            const scaleIx = 0;

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
        const boundary = findMinMaxValues(model.model.scales);
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
                TRANSITION_PROPS,
                handleOnStateSelected,
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
                    handleOnProbChanged,
                );

                createSlider(
                    gSliderScale,
                    ySliderScale,
                    yWidth,
                    currScaleIx,
                    true,
                    false,
                    false,
                    formatInt,
                    handleOnScaleChanged,
                );
            }
            createLinks(graphData[currentScaleIx], gNodes, gLinks, TRANSITION_PROPS);
            createMarkers(graphData[currentScaleIx], gMarkers);
        }
    }

    function findChildStates(state: any, prevScale: any) {
        return state.childStates.map((stateNo: number) => {
            const a = 1;
            return prevScale.states.find((el: any) => el.stateNo === stateNo);
        });
    }

    function addColorsToScaleStates(scales: any) {
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
                            console.log(dict[pseudoUniqueId(childState)]);

                            const curr = dict[pseudoUniqueId(childState)]; // FIXME: remove curr

                            state.color = generateColor(curr.middle, scaleIx, scales.length); // eslint-disable-line no-param-reassign
                            console.log('state=', state);
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

                                dict[pseudoUniqueId(state)] = {
                                    middle: sum / w,
                                    w,
                                };
                                state.color = generateColor(objCurr.middle, scaleIx, scales.length); // eslint-disable-line  no-param-reassign
                            } else {
                                console.log(
                                    'problem!!',
                                    'state=',
                                    state,
                                    'childState=',
                                    childState,
                                    'pseudoUniqueId(childState)=',
                                    pseudoUniqueId(childState),
                                    'dict[pseudoUniqueId(childState)]=',
                                    dict[pseudoUniqueId(childState)],
                                );
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

    function handleOnStateSelected(event: any, stateNo: number) {
        const selectedState = model.model.scales[currentScaleIx].states.find(
            (state: any) => state.stateNo === stateNo,
        );
        onStateSelected(selectedState);
    }

    function handleOnProbChanged(p: number) {
        setPThreshold(p);
    }

    function handleOnScaleChanged(val: number) {
        setCurrentScaleIx(Math.floor(val));
        onStateSelected(null);
    }

    return (
        <>
            <div ref={containerRef} style={{ backgroundColor: '#272b30' }} />
        </>
    );
};

export default MarkovChain;
