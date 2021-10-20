import { Tooltip } from "@material-ui/core";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { createSVG, drawLinksWihNodes, getSVG, TRANSITION_PROPS, createLinearScale, createLogScale, createNodes, createLinks, createMarkers, LinkType } from "../utils/markovChainUtils";
import { ModelVisualizationProps } from "./ModelVisualization";

export interface IMarkoChainProps {
    data: any[],
}

const MarkovChain = ({ scales }: any) => {
    const defaultP = 0.1;

    const containerRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    const [currentScaleIx, setCurrentScaleIx] = useState<number>(0);
    const [minSliderScale, setMinSliderScale] = useState<number>(0);
    const [maxSliderScale, setMaxSliderScale] = useState<number>(5);

    const [probThreshold, setProbThreshold] = useState<number>(0);


    useEffect(() => {
        if (scales && scales.length) {
            console.log("props.scales:");
            console.log(scales);

            renderMarkovChain();
        }
    }, [scales]) // eslint-disable-line react-hooks/exhaustive-deps


    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    function renderMarkovChain(): void {
        console.log("start: renderMarkovChain")

        setMinSliderScale(0);
        setMaxSliderScale(scales.length - 1);

        const width = containerRef?.current?.offsetWidth || 150;
        const height = 700;
        const margin = { top: 10, right: 10, bottom: 10, left: 10, };
        const chart = { top: 100, left: 100, };

        const currHeightData: any = scales[currentScaleIx];

        console.log("currHeightData:")
        console.log(currHeightData)

        if (currHeightData) {

            const xWidth = width - chart.left - margin.left - margin.right;
            const yWidth = height - chart.top - margin.top - margin.bottom;

            let graph = null;
            let gNodes = null;
            let gLinks = null;
            let gMarkers = null;

            console.log(`initialized = ${initialized} `);

            if (!initialized) {
                graph = createSVG(containerRef, width, height, margin);
                gLinks = graph.append("g").attr("class", "links");
                gNodes = graph.append("g").attr("class", "nodes");
                gMarkers = graph.append("g").attr("class", "markers");
                setInitialized(true);
            } else {
                graph = getSVG(containerRef, width, height, margin);
                gLinks = graph.select("g.links");
                gNodes = graph.select("g.nodes");
                gMarkers = graph.select("g.markers");
            }
            // const boundary = findMinMaxValues(scales); // FIXME: ds


            const boundary = {
                x: { min: 0, max: 300 },
                y: { min: 0, max: 300 },
                r: { min: 0, max: 300 },
            }

            console.log("boundary:")
            console.log(boundary)

            const x = createLinearScale([boundary.x.min, boundary.x.max], [0, xWidth]);
            const y = createLinearScale([boundary.y.max, boundary.y.min], [yWidth, 0]);
            const r = createLinearScale([boundary.r.min, boundary.r.max], [0, xWidth / 10]);
            const color = d3.scaleOrdinal(d3.schemeTableau10);

            const maxRadius = 200
            const graphData: any = createGraphData(currHeightData, maxRadius);

            console.log("graphData:")
            console.log(graphData)


            if (graphData) {
                console.log("##", 1)
                createNodes(graphData, gNodes, gLinks, gMarkers, x, y, r, color, TRANSITION_PROPS, (a: any, b: any) => {
                    const stateFound = currHeightData.states.find((state: any) => state.stateNo === b);
                    // setHistogramsData(stateFound.histograms)
                });
                console.log("##", 2)

                createLinks(graphData, gNodes, gLinks, TRANSITION_PROPS);

                console.log("##", 3)

                // createMarkers(graphData, gMarkers);

                console.log("##", 4)
            }
        }
    }

    function createGraphData(currHeightData: any, maxRadius: number) {

        const stateNoArr: any[] = currHeightData.states.map((state: any) => state.stateNo)

        const nodes: any[] = [];
        const links: any[] = [];

        currHeightData.states.forEach((state: any, stateIx: number) => {
            nodes.push({
                id: state.stateNo,
                ix: state.stateNo,
                x: randomInRange(0, 300),
                y: randomInRange(0, 300),
                r: maxRadius * randomInRange(0.1, 1),
                name: state.suggestedLabel ? state.suggestedLabel.label : state.stateNo,
                label: state.suggestedLabel ? state.suggestedLabel.label : state.stateNo,
                stationaryProbability: state.stationaryProbability,
            })

            const currStateLinks = state.nextStateProbDistr.map((p: any, pIx: any) => ({
                source: stateNoArr[stateIx],
                target: stateNoArr[pIx],
                p,
            }));

            links.push(currStateLinks)

        })

        const obj = {
            nodes,
            links: links.flat(),
        }

        obj.links = obj.links.map((link: any) => {
            let linkType: LinkType;
            const isBidirect = obj.links
                .some((l: any) => ((link.source === l.target) && (link.target === l.source)));

            if (link.source === link.target) {
                linkType = LinkType.SELF;
            } else if (isBidirect) {
                linkType = LinkType.BIDIRECT;
            } else {
                linkType = LinkType.SINGLE;
            }
            return { ...link, linkType }
        });

        return obj
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
        <div ref={containerRef} style={{ backgroundColor: "#272b30" }} />
    );
};

export default MarkovChain;
