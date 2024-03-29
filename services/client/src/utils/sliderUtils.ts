import * as d3 from 'd3';

export function createSlider(
    theme: any,
    gSlider: any,
    x: any,
    currVal: any,
    showTicks: boolean,
    showCurrVal: boolean,
    format: any,
    onSliderValChange: any,
) {
    gSlider
        .append('line')
        .attr('class', 'track')
        .style('stroke-linecap', 'round')
        .style('stroke', '#000')
        .style('stroke-opacity', theme.slider.default.opacity)
        .style('stroke-width', theme.slider.default.trackStrokeWidth)
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
        .select(function (this: any) {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-inset')
        .style('stroke-linecap', 'round')
        .style('stroke', '#dcdcdc')
        .style('stroke-width', theme.slider.default.trackInsetStrokeWidth)

        .select(function (this: any) {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr('class', 'track-overlay')
        .style('stroke-linecap', 'round')
        .style('pointer-events', 'stroke')
        .style('stroke-width', '50px')
        .style('stroke', 'transparent')
        .style('cursor', 'crosshair')
        .call(
            d3
                .drag()
                .on('start', function (this: any) {
                    return d3.select(this).interrupt();
                })
                .on('drag', (event: any) => {
                    updateSlider(
                        gSlider,
                        x.invert(event.x),
                        x,
                        showCurrVal,
                        format,
                        onSliderValChange,
                    );
                }),
        )
        .on('mouseover', function (this: any) {
            handleOnMouseOver.call(this, theme);
        })
        .on('mouseout', function (this: any) {
            handleOnMouseOut.call(this, theme);
        });

    gSlider
        .insert('g', '.track-overlay')
        .attr('class', 'ticks')
        .style('font-size', theme.slider.default.trackInsetStrokeWidth)
        .attr('transform', `translate(${0},${18})`)
        .selectAll('text')
        .data(x.ticks(10))
        .enter()
        .append('text')
        .style('fill', 'white')
        .attr('x', x)
        .attr('y', 10)
        .attr('text-anchor', 'middle')
        .text((d: any) => (showTicks ? format(d) : ''));

    const handle = gSlider
        .insert('circle', '.track-overlay')
        .attr('class', 'handle')
        .style('fill', '#fff')
        .style('stroke', '#000')
        .style('stroke-opacity', '0.5')
        .style('stroke-width', '1.25px')
        .attr('r', 9);

    const label = gSlider
        .append('text')
        .attr('class', 'label')
        .style('fill', 'white')
        .attr('text-anchor', 'middle')
        .text(showCurrVal ? x.domain()[0] : '')
        .attr('transform', `translate(${0}, -25)`);

    updateSlider(gSlider, currVal, x, showCurrVal, format, onSliderValChange);
}

export function updateSlider(
    slider: any,
    h: any,
    x: any,
    showCurrVal: any,
    format: any,
    onSliderValChange?: any,
) {
    if (onSliderValChange) {
        onSliderValChange(h);
    }
    slider.select('.handle').attr('cx', x(h));
    slider
        .select('.label')
        .attr('x', x(h))
        .text(showCurrVal ? format(h) : '');
}

function handleOnMouseOver(this: any, theme: any) {
    const parent = d3.select(this.parentNode);

    parent
        .select('.track')
        .transition()
        .duration(500)
        .style('stroke-width', theme.slider.mouseOver.trackStrokeWidth);

    parent
        .select('.track-inset')
        .transition()
        .duration(500)
        .style('stroke-width', theme.slider.mouseOver.trackInsetStrokeWidth);
}

function handleOnMouseOut(this: any, theme: any) {
    const parent = d3.select(this.parentNode);

    parent
        .select('.track')
        .transition()
        .duration(500)
        .style('stroke-width', theme.slider.default.trackInsetStrokeWidth);

    parent
        .select('.track-inset')
        .transition()
        .duration(500)
        .style('stroke-width', theme.slider.default.trackInsetStrokeWidth);
}
