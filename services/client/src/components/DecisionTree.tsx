import * as d3 from 'd3';
import { scaleOrdinal, easeQuadIn } from 'd3';
import React, { useRef, useEffect, useState } from 'react';

const DecisionTree = ({ selectedState, commonStateData }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [windowSize] = useState<any>({
        width: undefined,
        height: undefined,
    });
    const [initialized, setInitialized] = useState<boolean>();

    useEffect(() => {        
        if(selectedState && commonStateData) {
            
            const key = selectedState.initialStates.toString();
            const data = commonStateData[key];
    
            plotDecisionTree(selectedState, data);
        }
    }, [selectedState, commonStateData, windowSize]); // eslint-disable-line react-hooks/exhaustive-deps

    function  plotDecisionTree(state:any, data:any) {

        
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
        let gLinks = null;
        let gNodes = null;
          
        if(!initialized) {
            container = d3.select(containerRef.current);

            graph = container
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", classNames.decisionTree)
                .append("svg:g")
                .attr("transform", `translate(${opt.margin.left}, ${opt.margin.top})`);
            
            gLinks = graph.append("g").attr("class", "links");
            gNodes = graph.append("g").attr("class", "nodes");

            setInitialized(true);
            
        }  else{
            container = d3.select(containerRef.current);
            graph = container.select(`.${classNames.decisionTree}`);
            gLinks = graph.select("g.links")
            gNodes = graph.select("g.nodes")
        }

        if(state && data.decisionTree) {
         
            const treemap = d3.tree().size([opt.width, opt.height]);

            root = d3.hierarchy( data.decisionTree, (d:any) => d.children );
            root.x0 = height / 2;
            root.y0 = 0;


            updateChart(gNodes, gLinks, root, opt, colorMap, treemap, selectedState);
        } else {
            console.log("Decision tree data not found");
        }
    }

    function updateChart(gNodes:any, gLinks:any, source:any, opt:any, colorMap:any, treemap:any, state:any) {

        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
        console.log("stateNo=", state.stateNo, ", initialSt=", state.initialStates)
        console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

        console.log("source=", source)

      
        const duration = 500;

        const nSamples = source.data.nPos + source.data.nNeg;
    
        console.log("nSamples=", nSamples);
    
        const linkStrokeScale = d3
          .scaleSqrt()
          .domain([0, nSamples])
          .range([opt.link.minWidth, opt.link.maxWidth]);
    
        const treeData = treemap(source);
        const nodes = treeData.descendants();
        const links = treeData.links();
    
        nodes.forEach((d:any) => {
          d.y = d.depth * opt.depth; // eslint-disable-line
        });
    
        // Update the nodes…
        const node = gNodes.selectAll("g.node").data(nodes, (d:any) => {
            const id = `init_st_${state.initialStates}_l_${nodeLabel(d)}`;
            console.log("nodeId=", id)
            return id;
        });
    
        node.join(
          (enter:any) => {
            const enterTmp = enter;
    
            // Enter any new nodes at the parent's previous position.
            const nodeEnter = enterTmp
              .append("g")
              .attr("class", "node")
              .attr("id", (d:any) => `n_${d.id}`)
              .classed("leaf", (d:any) => !d.data.hasOwnProperty("splitAttr")) // eslint-disable-line
              .attr("transform", (d:any) => `translate(${source.x0},${source.y0})`);
    
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
                d.color = colorMap( d.data.hasOwnProperty("splitLabel") ? d.parent.data.splitAttr : d.data.splitAttr ); // eslint-disable-line
                return d.color;
              })
              .style("filter", "drop-shadow(0px 0px 5px rgba(0, 0, 0, .5))");
    
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
              .attr("transform", (d:any) => `translate(${d.x}, ${d.y})`);
    
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
    
            return nodeEnter;
          },
          (update:any) => update,
          (exit:any) => {
            const exitTmp = exit;
    
            const nodeExit = exitTmp
              .transition()
              .duration(duration)
              .attr("transform", (d:any) => `translate(${source.x}, ${source.y})`)
              .remove();
    
            nodeExit.select("rect").attr("width", 1e-6).attr("height", 1e-6);
    
            nodeExit.select("text").style("fill-opacity", 1e-6);
    
            return nodeExit;
          }
        );
    
        // Update the links
        const link = gLinks
          .selectAll("path.link")
          .data(
            links,
            (d:any) => {
                const id = `init_st_${state.initialStates}_s_${nodeLabel(d.source)}_t_${nodeLabel(d.target)}`;
                console.log("linkId=", id)
                return id
            }
          );
    
        link.join(
          (enter:any) => {
            const enterTmp = enter;
    
            // Enter any new links at the parent's previous position.
            const linkRez = enterTmp
              .insert("svg:path", "g")
              .attr("class", "link")
              .attr("d", (d:any) => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
              })
              .transition()
              .duration(duration)
              .attr("d", diagonal)
              .attr("fill", "none")
              .attr("stroke", "#ccc")
              .attr("transition", "0.2s ease-in-out")
              .style("stroke-width", (d:any) => {
                const n = d.target.data.nPos + d.target.data.nNeg;
                return `${linkStrokeScale(n)}`;
              });
    
            // Transition links to their new position.
            linkRez
              .transition()
              .duration(duration)
              .attr("d", diagonal)
              .style("stroke-width", (d:any) => {
                const n = d.target.data.nPos + d.target.data.nNeg;
                return `${linkStrokeScale(n)}`;
              });
    
            return linkRez;
          },
          (update:any) => {
              const updateTmp = update;
            
              return updateTmp .attr("d", (d:any) => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
              })
            


          },
          (exit:any) => exit
              .transition()
              .duration(duration)
              .attr("d", (d:any) => {
                const o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
              })
              .remove()
        );
    
        // Stash the old positions for transition.
        nodes.forEach((d:any) => {
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
