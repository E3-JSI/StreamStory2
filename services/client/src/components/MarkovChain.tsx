import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import {
    createSVG,
    getSVG,
    createLinearScale,
    createNodes,
    createLinks,
    createMarkers,
    createGraphContainer,
    getGraphContainer,
    findMinMaxValues,
    createGraphData,
    addColorsToScaleStates,
    addCoordinatesToStates,
} from '../utils/markovChainUtils';
import { ModelVisualizationProps } from './ModelVisualization';
import { createSlider } from '../utils/sliderUtils';
import { TRANSITION_PROPS } from '../types/charts';

const MarkovChain = ({ model, onStateSelected }: ModelVisualizationProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [currentScaleIx, setCurrentScaleIx] = useState<number>(0);
    const [currScaleIx] = useState<number>(0);
    const [data, setData] = useState<any>();
    const [windowSize] = useState<any>({ width: undefined, height: undefined });
    const [pThreshold, setPThreshold] = useState<number>(0.1);
    const [sliderProbPrecision] = useState<number>(2);
    const [theme, setTheme] = useState<any>();

    const darkTheme = {
        backgroundColor: '#272b30',
        state: {
            default: {
                stroke: '#a0a0a0',
                opacity: 0.9,
            },
            selected: {
                stroke: '#337ab7',
                opacity: 0.9,
            },
        },
        link: {
            default: {
                stroke: '#a0a0a0',
            },
            selected: {
                stroke: '#337ab7',
            },
        },
        marker: {
            default: {
                stroke: '#a0a0a0',
                fill: '#a0a0a0',
            },
            selected: {
                stroke: '#337ab7',
                fill: '#337ab7',
            },
        },
        slider: {
            default: {
                trackStrokeWidth: '8px',
                trackInsetStrokeWidth: '2px',
                opacity: 0.1,
            },
            mouseOver: {
                trackStrokeWidth: '10px',
                trackInsetStrokeWidth: '8px',
                opacity: 0.4,
            },
        },
    };

    useEffect(() => {
        if (model.model.scales && model.model.scales.length) {
            console.log('model.model.scales=', model.model.scales);

            const maxRadius = 100; // FIXME: hardcoded

            model.model.scales.forEach((sc: any) => {
                sc.states.forEach((state: any) => {
                    state.x = state.xCenter; // eslint-disable-line no-param-reassign
                    state.y = state.yCenter; // eslint-disable-line no-param-reassign
                    state.r = state.radius * maxRadius; // eslint-disable-line no-param-reassign
                });
            });
            addColorsToScaleStates(model.model.scales);
            const graphData = createGraphData(model.model.scales, pThreshold);
            setData(graphData);
            setTheme(darkTheme);
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
            const graphData = createGraphData(model.model.scales, pThreshold);
            setData(graphData);
            renderMarkovChain(data);
        }
    }, [windowSize, pThreshold, currentScaleIx]); // eslint-disable-line react-hooks/exhaustive-deps

    function renderMarkovChain(graphData: any): void {
        const boundary = findMinMaxValues(model.model.scales);

        console.log('boundary=', boundary);

        const width = containerRef?.current?.offsetWidth || 150; // FIXME: hardcoded
        const height = 700; // FIXME: hardcoded
        const margin = { top: 5, right: 5, bottom: 10, left: 10 }; // FIXME: hardcoded
        const chart = { top: 100, left: 100 }; // FIXME: hardcoded
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
                graph = createSVG(containerRef, darkTheme, width, height, margin); // FIXME: hardcoded theme
                gSliderProb = graph.append('g').attr('class', 'slider_prob');
                gSliderScale = graph.append('g').attr('class', 'c');
                graphContainer = createGraphContainer(graph, width, height, chart);
                gLinks = graphContainer.append('g').attr('class', 'links');
                gNodes = graphContainer.append('g').attr('class', 'nodes');
                gMarkers = graphContainer.append('g').attr('class', 'markers');
                setInitialized(true);
            } else {
                graph = getSVG(containerRef, width, height, margin);
                gSliderProb = graph.select('g.slider_prob');
                gSliderScale = graph.select('g.slider_scale');
                graphContainer = getGraphContainer(graph);
                gLinks = graphContainer.select('g.links');
                gNodes = graphContainer.select('g.nodes');
                gMarkers = graphContainer.select('g.markers');
            }

            graphContainer.attr('transform', `translate(${chart.left},${chart.top}) scale(0.7)`); // FIXME: hardcoded scale

            const zoom = d3
                .zoom()
                .scaleExtent([0, 5])

                .on('zoom', (event: any) => {
                    console.log('event=', event);
                    if (event) {
                        setCurrentScaleIx(Math.floor(event.transform.k));
                    }
                });

            graphContainer.call(zoom);

            const x = createLinearScale([boundary.x.min, boundary.x.max], [0, xWidth]);
            const y = createLinearScale([boundary.y.max, boundary.y.min], [yWidth, 0]);
            const r = createLinearScale(
                [boundary.r.min, boundary.r.max],
                [yWidth / 20, yWidth / 5],
            );

            console.log('r.range=', r.range(), ', r.domain=', r.domain());

            const xSliderProb = createLinearScale([0, 1], [0, xWidth]).clamp(true);
            const ySliderScale = createLinearScale(
                [0, model.model.scales.length],
                [yWidth, 0],
            ).clamp(true);

            const format2Decimals = d3.format(`.${sliderProbPrecision}f`); // FIXME: move to another file
            const formatInt = d3.format('.0f'); // FIXME: move to another file

            createNodes(
                darkTheme, // FIXME: put another variable
                graphData[currentScaleIx],
                gNodes,
                gLinks,
                gMarkers,
                tooltipRef,
                x,
                y,
                r,
                TRANSITION_PROPS,
                handleOnStateSelected,
            );
            if (!initialized) {
                createSlider(
                    darkTheme, // FIXME: another variable
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
                    darkTheme, // FIXME: another variable
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
            createLinks(
                darkTheme,
                graphData[currentScaleIx],
                gNodes,
                gLinks,
                x,
                y,
                TRANSITION_PROPS,
            );
            createMarkers(darkTheme, graphData[currentScaleIx], gMarkers);
        }
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
            <div ref={tooltipRef} />
            <div ref={containerRef} />
        </>
    );
};

export default MarkovChain;
