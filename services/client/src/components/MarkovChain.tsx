import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { createSVG, getSVG, TRANSITION_PROPS, createLinearScale, createNodes, createLinks, createMarkers, LinkType, createMatrix, getMatrix, createPowScale } from "../utils/markovChainUtils";
import { ModelVisualizationProps } from "./ModelVisualization";
import { createSlider } from "../utils/sliderUtils";

export interface IMarkoChainProps {
    data: any[],
}

const MarkovChain = ({ model, onStateSelected }: ModelVisualizationProps) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const [debug] = useState<boolean>(true);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [currentScaleIx, setCurrentScaleIx] = useState<number>(0);
    const [maxRadius] = useState<number>(130);
    const [currScaleIx] = useState<number>(0);
    const [data, setData] = useState<any>();
    const [windowSize] = useState<any>({ width: undefined, height: undefined });

    const [pThreshold, setPThreshold] = useState<number>(0.1);
    const [sliderProbPrecision] = useState<number>(2);

    useEffect(() => {
        if (model.model.scales && model.model.scales.length) {

            console.log("model.model.scales:")
            console.log(model.model.scales)

            const dictId = createDictId(model.model.scales);
            const statesDict = createStatesDict(model.model.scales, dictId);

            const graphData = createGraphData(model.model.scales, statesDict, dictId);
            setData(graphData)

            renderMarkovChain(graphData[currentScaleIx]);
        }
    }, [model.model.scales]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (model.model.scales && model.model.scales.length && data && data.length) {
            const graphData = data[currentScaleIx]
            renderMarkovChain(graphData);
        }
    }, [windowSize, pThreshold, currentScaleIx]) // eslint-disable-line react-hooks/exhaustive-deps

    function renderMarkovChain(graphData: any): void {
        console.log("start: renderMarkovChain")

        const width = containerRef?.current?.offsetWidth || 150;
        const height = 700;
        const margin = { top: 20, right: 20, bottom: 20, left: 20, };
        const chart = { top: 50, left: 50 };

        if (graphData && model.model.scales[currentScaleIx]) {
            const xWidth = width - chart.left - margin.left - margin.right;
            const yWidth = height - chart.top - margin.top - margin.bottom;

            let graph = null;
            let matrix = null;
            let gNodes = null;
            let gLinks = null;
            let gMarkers = null;
            let gSliderProb = null;
            let gSliderScale = null;

            console.log(`initialized = ${initialized} `);

            if (!initialized) {
                graph = createSVG(containerRef, width, height, margin);
                matrix = createMatrix(graph, width, height, chart);
                matrix.append("rect")
                    .attr("width", xWidth)
                    .attr("height", yWidth)
                    .style("fill", "#1a6048")
                    .style("opacity", "0.1")
                    .style("stroke-width", "1")
                    .style("stroke", "white");

                gLinks = matrix.append("g").attr("class", "links");
                gNodes = matrix.append("g").attr("class", "nodes");
                gMarkers = matrix.append("g").attr("class", "markers");
                gSliderProb = matrix.append("g").attr("class", "slider_prob");
                gSliderScale = matrix.append("g").attr("class", "slider_scale");
                setInitialized(true);
            } else {
                graph = getSVG(containerRef, width, height, margin);
                matrix = getMatrix(graph)
                gLinks = matrix.select("g.links");
                gNodes = matrix.select("g.nodes");
                gMarkers = matrix.select("g.markers");
                gSliderProb = matrix.select("g.slider_prob");
                gSliderScale = matrix.select("g.slider_scale");
            }

            // const boundary = findMinMaxValues(scales); // FIXME: ds
            const boundary = { // FIXME: hardcoded
                x: { min: 0, max: 300 },
                y: { min: 0, max: 300 },
                r: { min: 0, max: 300 },
            }
            const x = createLinearScale([boundary.x.min, boundary.x.max], [0, xWidth]);
            const y = createLinearScale([boundary.y.max, boundary.y.min], [yWidth, 0]);
            const r = createLinearScale([boundary.r.min, boundary.r.max], [0, yWidth]);
            const color = d3.scaleOrdinal(d3.schemeTableau10);
            const xSliderProb = createLinearScale([0, 1], [0, xWidth]).clamp(true);
            const ySliderScale = createLinearScale([0, model.model.scales.length], [yWidth, 0]).clamp(true);

            const format2Decimals = d3.format(`.${sliderProbPrecision}f`);
            const formatInt = d3.format(".0f");

            if (graphData) {
                // FIXME: when moved to if init, duplicate colors should not be the issue
                createNodes(graphData, gNodes, gLinks, gMarkers, x, y, r, color, TRANSITION_PROPS, (a: any, b: any) => {
                    const selectedState = model.model.scales[currentScaleIx].states.find((state: any) => state.stateNo === b); // eslint-disable-line no-param-reassign
                    onStateSelected(selectedState);
                });

                if (!initialized) {
                    createSlider(gSliderProb, xSliderProb, yWidth, pThreshold, false, true, true, format2Decimals, (p: number) => setPThreshold(p));

                    let prevIx = -1;
                    createSlider(gSliderScale, ySliderScale, yWidth, currScaleIx, true, false, false, formatInt, (val: number) => {
                        const valFloor = Math.floor(val);

                        if (valFloor !== prevIx) {
                            setCurrentScaleIx(valFloor)
                            prevIx = valFloor;
                        }
                    });
                }
                createLinks(graphData, gNodes, gLinks, TRANSITION_PROPS);
                createMarkers(graphData, gMarkers);
            }
        }
    }

    function uniqueId(state: any, scaleIx: number) {
        return `uid=${state.suggestedLabel.label}_statProb=${state.stationaryProbability}`;
    }

    function createDictId(scales: any) {
        const dict: any = {};
        let stateId = 0;

        scales.forEach((scale: any, scaleIx: number) => {
            scale.states.forEach((state: any) => {
                const key = uniqueId(state, scaleIx);

                if (!dict[key]) {
                    dict[key] = stateId
                    stateId += 1;
                }
            });
        });
        return dict;
    }

    function createStatesDict(scales: any, dictId: any) {
        const statesDict: any = {};

        scales.forEach((scale: any, scaleIx: number) => {
            scale.states.forEach((state: any, i: number) => {
                let x = -1;
                let y = -1;
                const key = uniqueId(state, scaleIx);
                const currStateId = dictId[key];

                if (scale.areTheseInitialStates) {
                    const currAngle = (360 / scale.states.length) * i;
                    x = (maxRadius * Math.sin(Math.PI * 2 * currAngle / 360) + maxRadius);
                    y = (maxRadius * Math.cos(Math.PI * 2 * currAngle / 360) + maxRadius);
                } else if (!scale.areTheseInitialStates && !statesDict[currStateId]) {
                    let xSum = 0;
                    let ySum = 0;
                    state.childStates.forEach((stateNo: number) => {
                        const childState = scales[scaleIx - 1].states.find((el: any) => el.stateNo === stateNo);
                        const childKey = uniqueId(childState, scaleIx - 1)

                        // console.log("childKey=", childKey, "statesDict[childStateId]=", statesDict[childKey], ", statesDict=", statesDict)

                        xSum += statesDict[childKey].x;
                        ySum += statesDict[childKey].y;
                    });
                    x = xSum / state.childStates.length;
                    y = ySum / state.childStates.length;
                }

                const stateId = dictId[uniqueId(scale.states[i], scaleIx)];

                let label = "";

                if (debug) {
                    // label = `${stateId}_${state.suggestedLabel.label}_${state.stationaryProbability.toFixed(4)}`
                    label = `${state.suggestedLabel.label}_${state.stationaryProbability.toFixed(4)}`
                } else {
                    label = state.suggestedLabel.label
                }

                const obj = {
                    id: stateId,
                    x,
                    y,
                    stateNo: state.stateNo,
                    r: maxRadius * state.stationaryProbability,
                    label,
                    stationaryProbability: state.stationaryProbability,
                }
                statesDict[key] = obj
            });
        });
        return statesDict;
    }

    function createGraphData(scales: any, stateDict: any, dictId: any) {
        return scales.map((scale: any, scaleIx: number) => {
            const links: any[] = [];
            const nodes: any[] = []

            scale.states.forEach((state: any, stateIx: number) => {
                links.push(createStateLinks(stateIx, state, scaleIx, scale, dictId));
                nodes.push(stateDict[uniqueId(state, scaleIx)])
            });
            return { nodes, links: links.flat() }
        });
    }

    function createStateLinks(stateIx: number, state: any, scaleIx: number, scale: any, dictId: any) {
        const sourceId = dictId[uniqueId(state, scaleIx)]

        return state.nextStateProbDistr
            .filter(isValidProb)
            .map((p: number, i: number) => {
                let linkType = null;
                const stateFound = scale.states.find((s: any) => isValidProb(s.nextStateProbDistr[stateIx]));

                if (stateFound == null) {
                    linkType = LinkType.SINGLE;
                } else if (stateFound.stateNo === state.stateNo) {
                    linkType = LinkType.SELF;
                } else {
                    linkType = LinkType.BIDIRECT;
                }
                return {
                    source: sourceId,
                    target: dictId[uniqueId(scale.states[i], scaleIx)],
                    linkType,
                    p,
                }
            });
    }

    function isValidProb(p: number) {
        return ((p > 0) && (p >= pThreshold));
    }



    function findMinMaxValues(dataset: any[]) {
        const rez = {
            x: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
            y: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
            r: { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER }
        }

        dataset.forEach((height: any) => {
            height.states.forEach((state: any) => {
                rez.x.min = Math.min(rez.x.min, state.x);
                rez.x.max = Math.max(rez.x.max, state.x);
                rez.y.min = Math.min(rez.y.min, state.y);
                rez.y.max = Math.max(rez.y.max, state.y);
                rez.r.min = Math.min(rez.r.min, state.radius * state.stationaryProbability);
                rez.r.max = Math.max(rez.r.max, state.radius * state.stationaryProbability);
            });
        });
        return rez;
    }

    return (

        <>
            <div ref={containerRef} style={{ backgroundColor: "#272b30" }} />
        </>
    );
};

export default MarkovChain;
