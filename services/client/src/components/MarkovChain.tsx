import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@material-ui/core/styles';

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
} from '../utils/markovChainUtils';
import { ModelVisualizationProps } from './ModelVisualization';
import { createSlider, updateSlider } from '../utils/sliderUtils';
import { TRANSITION_PROPS } from '../types/charts';

const MarkovChain = ({ model, onStateSelected }: ModelVisualizationProps) => {
    const useThemeLoaded = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const containerStateHistoryRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [initializedStateHistory, setInitializedStateHistory] = useState<boolean>(false);
    const [currentScaleIx, setCurrentScaleIx] = useState<number>(0);
    const [data, setData] = useState<any>();
    const [windowSize] = useState<any>({ width: undefined, height: undefined });
    const [pThreshold, setPThreshold] = useState<number>(0.1);
    const [sliderProbPrecision] = useState<number>(2);

    function createTheme() {
        const themeCurr = {
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
            stateText: {
                default: {
                    // fill: uTheme.palette.text.primary,
                    fill: 'black',
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
            linkText: {
                default: {
                    fill: useThemeLoaded.palette.text.primary,
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
        return themeCurr;
    }

    useEffect(() => {
        if (model.model.scales && model.model.scales.length) {
            console.log('model=', model);
            console.log('model.model.scales=', model.model.scales);

            const maxRadius = 100; // FIXME: hardcoded

            model.model.scales.forEach((sc: any) => {
                sc.states.forEach((state: any) => {
                    state.x = state.xCenter; // eslint-disable-line no-param-reassign
                    state.y = state.yCenter; // eslint-disable-line no-param-reassign
                    state.r = state.radius * maxRadius; // eslint-disable-line no-param-reassign
                });
            });

            setCurrentScaleIx(model.model.scales.length - 1);

            addColorsToScaleStates(model.model.scales);
            const graphData = createGraphData(model.model.scales, pThreshold);
            setData(graphData);
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
    }, [windowSize, pThreshold, currentScaleIx, useThemeLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    function renderMarkovChain(graphData: any): void {
        const format2Decimals = d3.format(`.${sliderProbPrecision}f`); // FIXME: move to another file

        const theme = createTheme();
        const boundary = findMinMaxValues(model.model.scales);
        const width = containerRef?.current?.offsetWidth || 150; // FIXME: hardcoded
        const height = 700; // FIXME: hardcoded
        const margin = { top: 5, right: 5, bottom: 10, left: 10 }; // FIXME: hardcoded
        const chart = { top: 130, left: 100 }; // FIXME: hardcoded
        const xWidth = width - chart.left - margin.left - margin.right;
        const yWidth = height - chart.top - margin.top - margin.bottom;

        if (graphData && model.model.scales[currentScaleIx]) {
            let graph = null;
            let graphContainer = null;
            let gNodes = null;
            let gLinks = null;
            let gMarkers = null;
            let gSliderProb = null;
            let gSliderScale: any = null;

            if (!initialized) {
                graph = createSVG(containerRef, width, height, margin); // FIXME: hardcoded theme
                gSliderProb = graph.append('g').attr('class', 'slider_prob');
                gSliderScale = graph.append('g').attr('class', 'slider_scale');
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
            let direction = 1; // FIXME: not elegant solution
            const zoom = d3
                .zoom<any, any>()
                .scaleExtent([0, 20])
                .wheelDelta((event: any) => {
                    direction = event.deltaY > 0 ? 1 : -1;
                    return (
                        event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) // eslint-disable-line  no-nested-ternary
                    );
                })
                .on('zoom', (event: any) => {
                    const scaleIxNew = currentScaleIx + direction;

                    if (Math.floor(event.transform.k) % 1 === 0) {
                        setCurrentScaleIx(scaleIxNew);
                        const val = scaleIxNew;
                        const ySliderScale = createLinearScale(
                            [0, model.model.scales.length - 1],
                            [yWidth, 0],
                        ).clamp(true);
                        gSliderScale.select('.handle').attr('cx', ySliderScale(val));
                        gSliderScale.select('.label').attr('x', ySliderScale(val));
                    }
                });

            graph.select('.zoom_rect').call(zoom);
            gNodes.call(zoom);
            gLinks.call(zoom);

            graphContainer.attr('transform', `translate(${chart.left},${chart.top}) scale(0.8)`); // FIXME: hardcoded scale

            const x = createLinearScale([boundary.x.min, boundary.x.max], [0, xWidth]);
            const y = createLinearScale([boundary.y.max, boundary.y.min], [yWidth, 0]);
            const r = createLinearScale(
                [boundary.r.min, boundary.r.max],
                [yWidth / 20, yWidth / 5],
            );
            const xSliderProb = createLinearScale([0, 1], [0, xWidth]).clamp(true);
            const ySliderScale = createLinearScale(
                [0, model.model.scales.length - 1],
                [yWidth, 0],
            ).clamp(true);

            createNodes(
                theme,
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
                const probStartX = 50;
                const probStartY = height - 50;

                createSlider(
                    theme,
                    gSliderProb,
                    xSliderProb,
                    probStartX,
                    probStartY,
                    pThreshold,
                    false,
                    false,
                    true,
                    format2Decimals,
                    handleOnProbChanged,
                );

                const scaleStartX = 0 + margin.left + 20;
                const scaleStartY = 0 + margin.right + 20;

                createSlider(
                    theme,
                    gSliderScale,
                    ySliderScale,
                    scaleStartX,
                    scaleStartY,
                    model.model.scales.length - 1,
                    true,
                    false,
                    false,
                    null,
                    handleOnScaleChanged,
                );
            }
            createLinks(theme, graphData[currentScaleIx], gNodes, gLinks, x, y, TRANSITION_PROPS);
            createMarkers(theme, graphData[currentScaleIx], gMarkers);

            createStateHistory();
        }
    }

    // stateHistoryTimes
    // stateHistoryInitialStates

    function createStateHistory() {
        console.log('start: createStateHistory');
        console.log('stateHistoryTimes=', model.model.stateHistoryTimes);
        console.log('stateHistoryInitialStates=', model.model.stateHistoryInitialStates);

        model.model.scales.forEach((sc: any, scIx: number) => {
            console.log('start: scIx=', scIx);
            sc.states.forEach((state: any) => {
                console.log('... stateNo=', state.stateNo, 'initStates=', state.initialStates);
            });
            console.log('\n');
        });

        const width = containerStateHistoryRef?.current?.offsetWidth || 150; // FIXME: hardcoded
        const height = 700; // FIXME: hardcoded
        const margin = { top: 5, right: 5, bottom: 10, left: 10 }; // FIXME: hardcoded
        const chart = { top: 130, left: 100 }; // FIXME: hardcoded
        const xWidth = width - chart.left - margin.left - margin.right;
        const yWidth = height - chart.top - margin.top - margin.bottom;

        console.log('xWidth=', xWidth, 'yWidth=', yWidth);

        const xExtent = d3.extent(model.model.stateHistoryTimes).map((d: any) => new Date(d));
        const yCategories = model.model.scales.map((el: any, i: any) => `scale_${i}`);

        let uniqueStates: any[] = Array.from(new Set(model.model.stateHistoryInitialStates)); // FIXME: change if for other scales
        uniqueStates.sort((a: any, b: any) => a - b);
        uniqueStates = uniqueStates.map((el: number) => `${el}`);

        const dataCurr = [];

        const statesCurr = [];

        for (let i = 0; i < model.model.stateHistoryInitialStates.length; i++) {
            const stateName = `${model.model.stateHistoryInitialStates[i]}`;
            const duration =
                model.model.stateHistoryTimes[i + 1] - model.model.stateHistoryTimes[i];
            const state = { start: model.model.stateHistoryTimes[i], duration, state: stateName };
            statesCurr.push(state);
        }
        console.log('statesCurr=', statesCurr);
        const obj = { scale: yCategories[0], states: statesCurr };
        dataCurr.push(obj);

        console.log('dataCurr=', dataCurr);

        const x = d3.scaleTime().domain(xExtent).range([0, xWidth]);
        const y = d3.scaleBand().domain(yCategories).range([yWidth, 0]).padding(0.1);
        const color = d3.scaleOrdinal().domain(uniqueStates).range(d3.schemePaired);

        yCategories.forEach((category: any) => console.log(y(category)));

        let graph = null;
        let graphContainer = null;
        let gAxisX = null;
        let gAxisY = null;
        let gBars = null;

        if (!initializedStateHistory) {
            graph = createSVG(containerStateHistoryRef, width, height, margin); // FIXME: hardcoded theme
            graphContainer = createGraphContainer(graph, width, height, chart);
            gBars = graphContainer.append('g').attr('class', 'bars');
            gAxisX = graphContainer.append('g').attr('class', 'axisX');
            gAxisY = graphContainer.append('g').attr('class', 'axisY');
            setInitializedStateHistory(true);
        } else {
            graph = getSVG(containerStateHistoryRef, width, height, margin);
            graphContainer = getGraphContainer(graph);
            gBars = graphContainer.select('g.bars');
            gAxisX = graphContainer.select('g.axisX');
            gAxisY = graphContainer.select('g.axisY');
        }

        graph
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'grey')
            .style('opacity', 0.1);

        graphContainer
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'green')
            .style('opacity', 0.1);

        const xAxis = d3.axisBottom(x).tickSizeOuter(0);
        gAxisX.attr('transform', `translate(0, ${yWidth})`).call(xAxis);

        gAxisY
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y))
            .call((g: any) => g.select('.domain').remove());

        gBars
            .selectAll('g')
            .data(dataCurr)
            .join('g')
            .attr('class', (d: any) => `scale_${d.scale}`)
            .selectAll('rect')
            // // enter a second tcroup per subgroup to add all rectangles
            .data((d: any) => d.states)
            .join('rect')
            .attr('class', 'state')
            .attr('id', (d: any) => `${d.state}`)
            .attr('x', (d: any) => x(d.start))
            .attr('y', (d: any) => y(d.scale))
            .attr('width', (d: any, i: number) => x(d.duration)) // FIXME: duration not ok computed
            .attr('height', (d: any) => y.bandwidth())
            .attr('fill', (d: any) => {
                console.log('color(d.state)=', color(d.state), ', d=', d);
                return color(d.state);
            });
        // .on('click', (event: any, d: any) => {
        //     const statesFound = d3
        //         .selectAll('.state')
        //         .nodes()
        //         .forEach((el: any) => {
        //             const rect = d3.select(el);
        //             const dataTmp: any = rect.data()[0];
        //             if (d.state === dataTmp.state) {
        //                 d3.select(el).style('stroke', 'white').style('stroke-width', 2);
        //             } else {
        //                 rect.style('stroke-width', 0);
        //             }
        //         });
        // });
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
            <div ref={containerStateHistoryRef} />
            <div ref={tooltipRef} />
            <div ref={containerRef} />
        </>
    );
};

export default MarkovChain;
