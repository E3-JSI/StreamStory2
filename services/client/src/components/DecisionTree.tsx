import * as d3 from 'd3';
import { scaleOrdinal, easeQuadIn } from 'd3';
import React, { useRef, useEffect, useState } from 'react';

const DecisionTree = ({ selectedState }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [windowSize] = useState<any>({
        width: undefined,
        height: undefined,
    });
    const [initialized, setInitialized] = useState<boolean>();

    useEffect(() => {
        console.log("start: useEffect, selectedState=", selectedState)


        if(selectedState) {
            console.log("if selectedState")
            plotDecisionTree(selectedState);
        }
    }, [selectedState, windowSize]); // eslint-disable-line react-hooks/exhaustive-deps

    function  plotDecisionTree(state:any) {

        console.log("start: plotDecisionTree, state=", state)

        const opt = {
            margin: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                },
                width: 800,
                height: 1800,
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
            decisionTree: "decision-tree",
            hover: "hover",
            predictionPanel: "prediction-panel",
        };

        const colorMap = d3.scaleOrdinal(d3.schemeCategory10);

        const width = opt.width + opt.margin.right + opt.margin.left;
        const height = opt.height + opt.margin.top + opt.margin.bottom;

        let root:any = null;

        let container = null;
        let graph = null;
        let gNodes = null;
        let gLinks = null;
          
        if(!initialized) {
            container = d3.select(containerRef.current);

            graph = container
                .style("position", "relative")
                .append("svg:svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", classNames.decisionTree)
                .append("svg:g")
                .attr("transform", `translate(${opt.margin.left}, ${opt.margin.top})`);
            
            gNodes = graph.append("g").attr("class", "nodes");
            gLinks = graph.append("g").attr("class", "links");
            
        }  else{
            container = d3.select(containerRef.current);
            graph = container.select(`.${classNames.decisionTree}`);
            gNodes = graph.select("g.nodes")
            gLinks = graph.select("g.links")
        }

        const data = state.decisionTree;

        if(data) {
         
            const treemap = d3.tree().size([opt.width, opt.height]);

            root = d3.hierarchy(data,  (d:any) => d.children );
            root.x0 = height / 2;
            root.y0 = 0;


            update(gNodes, gLinks,root, opt, colorMap, treemap);
        } else {
            console.log("Decision tree data not found");
        }
    }

    function update(gNodes:any, gLinks:any, source:any, opt:any, colorMap:any, treemap:any) {
        console.log("start: update")

        const duration = 500;

        const nSamples = source.data.nPos + source.data.nNeg;

        console.log("nSamples=", nSamples);

        const linkStokeScale = d3
            .scaleSqrt()
            .domain([0, nSamples])
            .range([opt.link.minWidth, opt.link.maxWidth]);

        const treeData = treemap(source);
        const nodes = treeData.descendants();
        const links = treeData.links();

        nodes.forEach((d:any) => {
            d.y = d.depth * opt.depth; // eslint-disable-line no-param-reassign
        });

        let i = 0; // FIXME: before global

        // Update the nodes…
        const node = gNodes.selectAll("g.node").data(nodes, (d:any) => {
            d.id || (d.id = ++i); // eslint-disable-line
        });

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("id", (d:any) => `n_${d.id}`)
            .classed("leaf", (d:any) => !d.data.hasOwnProperty("splitAttr")) // eslint-disable-line no-prototype-builtins
            .attr("transform", (d:any) => `translate(${source.x0}, ${source.y0})`)
            .attr("data-id", (d:any) => d.id);

        nodeEnter
            .append("rect")
            .attr("width", 133 + 8)
            .attr("height", 70)
            .attr("x", (d:any) => {
                const label = nodeLabel(d);

                const textLen = label.length * opt.char_to_pxl;
                const width = d3.max([opt.node.width, textLen]);
                return -width / 2;
            })
            .attr("rx", 6)
            .attr("ry", 6)
            .style("fill", (d:any) => {
                d.color = colorMap( // eslint-disable-line
                d.data.hasOwnProperty("splitLabel") // eslint-disable-line
                    ? d.parent.data.splitAttr
                    : d.data.splitAttr
                );
                return d.color;
            })
            .style("filter", "drop-shadow(0px 0px 5px rgba(0, 0, 0, .5))");

            const radius = 20;
            const colorPie = d3.scaleOrdinal().range(["green", "red"]);
            const pie = d3.pie().value((d:any) => d[1]);

        nodeEnter
            .selectAll(".pie_chart")
            .data((d:any) => {
                const obj ={ nPos: d.data.nPos, nNeg: d.data.nNeg };
                const entries:any[] = Object.entries(obj);
                const rez = pie(entries);
                return rez;
            })
            .join("path")
            .attr("class", "pie_chart")
            .attr("d", d3.arc().innerRadius(0).outerRadius(radius))
            .attr("fill", (d:any) => colorPie(d.data[1]))
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.7);

        nodeEnter
            .append("text")
            .attr("dy", "18px")
            .attr("text-anchor", "middle")
            .text((d:any) => nodeLabel(d))
            .style("fill-opacity", 1e-6)
            .style("filter", "drop-shadow(0px 0px 5px rgba(0, 0, 0, .5))")
            .style("fill", "white");

        // Transition nodes to their new position.
        const nodeUpdate = nodeEnter
            .transition()
            .duration(duration)
            .attr("transform", (d:any) =>  `translate(${d.x}, ${d.y})`);

        nodeUpdate
            .select("rect")
            .attr("width", (d:any) => {
                const label = nodeLabel(d);
                const textLen = label.length * opt.char_to_pxl;
                const width = d3.max([opt.node.width, textLen]);
                return width;
            })
            .attr("height", opt.node.height);

        nodeUpdate.select("text").style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node
            .exit()
            .transition()
            .duration(duration)
            .attr("transform", (d:any) => `translate(${source.x}, ${source.y})`)
            .remove();

        nodeExit.select("rect").attr("width", 1e-6).attr("height", 1e-6);

        nodeExit.select("text").style("fill-opacity", 1e-6);

        // Update the links
        const link = gLinks.selectAll("path.link").data(links, (d:any) => d.target.id);

        // Enter any new links at the parent's previous position.
        link
            .enter()
            .insert("svg:path", "g")
            .attr("class", "link")
            .attr("d", (d:any) => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
            })
            .attr("data-id", (d:any) => d.target.id)
            .transition()
            .duration(duration)
            .attr("d", diagonal)
            .style("stroke-width", (d:any) => {
                const n = d.target.data.nPos + d.target.data.nNeg;
                return `${linkStokeScale(n)}`;
            });

        // Transition links to their new position.
        link
            .transition()
            .duration(duration)
            .attr("d", diagonal)
            .style("stroke-width", (d:any) => {
                const n = d.target.data.nPos + d.target.data.nNeg;
                return `${linkStokeScale(n)}`;
            });

        // Transition exiting nodes to the parent's new position.
        link
            .exit()
            .transition()
            .duration(duration)
            .attr("d", (d:any) => {
                const o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d:any) { // eslint-disable-line
            d.x0 = d.x; // eslint-disable-line
            d.y0 = d.y; // eslint-disable-line
        });
    }    

    function diagonal(data:any) {
        return d3
            .linkHorizontal()
            .x((d:any) => d.x)
            .y((d:any) => d.y)(data);
    }

    // Node labels
    function nodeLabel(d:any) {
        return d.data.hasOwnProperty("splitLabel") // eslint-disable-line
            ? `${d.parent.data.splitAttr} ${d.data.splitLabel}`
            : d.data.splitAttr;
    }
        
    return (
        <>
            <div ref={containerRef} />
        </>
    );
};
export default DecisionTree;
