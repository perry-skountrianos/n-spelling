// Math diagram SVG helpers. All return an SVG string.
// Used by math-practice-data.js / math-practice-bank.js via question.image
(function(){
    const STROKE = '#1976d2';
    const FILL = 'rgba(33,150,243,0.12)';
    const LBL = '#333';
    const DIM = '#666';

    function svg(w, h, body) {
        return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:300px;display:block;margin:8px auto 14px;" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
    }
    function txt(x, y, s, opts={}) {
        const sz = opts.size || 13;
        const c = opts.color || LBL;
        const w = opts.weight || 600;
        const a = opts.anchor || 'middle';
        return `<text x="${x}" y="${y}" font-size="${sz}" font-weight="${w}" fill="${c}" text-anchor="${a}" font-family="-apple-system,Segoe UI,sans-serif">${s}</text>`;
    }
    // Tick mark for equal sides — small line segment perpendicular to a side
    function tick(x1, y1, x2, y2, n=1) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const ux = dx / len, uy = dy / len;
        // perpendicular
        const px = -uy, py = ux;
        const out = [];
        const spacing = 4;
        const tickLen = 5;
        for (let i = 0; i < n; i++) {
            const off = (i - (n - 1) / 2) * spacing;
            const cx = mx + ux * off, cy = my + uy * off;
            out.push(`<line x1="${cx - px*tickLen}" y1="${cy - py*tickLen}" x2="${cx + px*tickLen}" y2="${cy + py*tickLen}" stroke="${STROKE}" stroke-width="2"/>`);
        }
        return out.join('');
    }
    function rightAngle(x, y, dx, dy) {
        // small square at corner pointing in given x/y unit directions
        const s = 8;
        return `<polyline points="${x + dx*s},${y} ${x + dx*s},${y + dy*s} ${x},${y + dy*s}" fill="none" stroke="${STROKE}" stroke-width="1.5"/>`;
    }

    const shapes = {
        rectangle: function(opts) {
            const wL = opts.widthLabel || opts.width || 'w';
            const hL = opts.heightLabel || opts.height || 'h';
            return svg(260, 160, [
                `<rect x="40" y="35" width="180" height="90" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                rightAngle(40, 35, 1, 1),
                txt(130, 25, wL),
                txt(28, 85, hL, {anchor:'end'}),
            ].join(''));
        },
        square: function(opts) {
            const sL = opts.sideLabel || opts.side || 's';
            return svg(220, 200, [
                `<rect x="55" y="35" width="110" height="110" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                rightAngle(55, 35, 1, 1),
                tick(55, 35, 165, 35), // top
                tick(165, 35, 165, 145), // right
                tick(165, 145, 55, 145), // bottom
                tick(55, 145, 55, 35), // left
                txt(110, 25, sL),
                txt(170, 95, sL, {anchor:'start'}),
            ].join(''));
        },
        triangle: function(opts) {
            // generic triangle — draws a triangle with base and a height altitude line
            const bL = opts.baseLabel || opts.base || 'base';
            const hL = opts.heightLabel || opts.height || 'height';
            return svg(280, 180, [
                // triangle
                `<polygon points="40,140 240,140 130,40" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                // height (dashed altitude from apex to base)
                `<line x1="130" y1="40" x2="130" y2="140" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
                rightAngle(130, 140, -1, -1),
                // labels
                txt(140, 90, hL, {anchor:'start', color: DIM}),
                txt(140, 158, bL),
            ].join(''));
        },
        rightTriangle: function(opts) {
            const bL = opts.baseLabel || 'base';
            const hL = opts.heightLabel || 'height';
            return svg(260, 180, [
                `<polygon points="40,140 220,140 40,40" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                rightAngle(40, 140, 1, -1),
                txt(130, 158, bL),
                txt(28, 90, hL, {anchor:'end'}),
            ].join(''));
        },
        isoscelesTriangle: function(opts) {
            const sL = opts.sideLabel || 'side';
            const bL = opts.baseLabel || 'base';
            return svg(280, 180, [
                `<polygon points="40,140 240,140 140,40" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                tick(40, 140, 140, 40, 1), // left side
                tick(140, 40, 240, 140, 1), // right side
                txt(80, 90, sL, {anchor:'end'}),
                txt(200, 90, sL, {anchor:'start'}),
                txt(140, 158, bL),
            ].join(''));
        },
        equilateralTriangle: function(opts) {
            const sL = opts.sideLabel || 'side';
            return svg(260, 180, [
                `<polygon points="40,150 220,150 130,40" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                tick(40, 150, 130, 40, 2),
                tick(130, 40, 220, 150, 2),
                tick(220, 150, 40, 150, 2),
                txt(70, 100, sL, {anchor:'end'}),
                txt(190, 100, sL, {anchor:'start'}),
                txt(130, 168, sL),
            ].join(''));
        },
        scaleneTriangle: function(opts) {
            return svg(280, 180, [
                `<polygon points="30,150 250,150 180,40" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                txt(105, 100, opts.aLabel || 'a', {anchor:'end'}),
                txt(225, 100, opts.bLabel || 'b', {anchor:'start'}),
                txt(140, 168, opts.cLabel || 'c'),
            ].join(''));
        },
        parallelogram: function(opts) {
            const bL = opts.baseLabel || opts.base || 'base';
            const hL = opts.heightLabel || opts.height || 'height';
            return svg(280, 170, [
                `<polygon points="60,130 240,130 220,40 40,40" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                // height altitude (dashed)
                `<line x1="40" y1="40" x2="40" y2="130" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
                rightAngle(40, 130, 1, -1),
                txt(150, 148, bL),
                txt(28, 88, hL, {anchor:'end', color: DIM}),
            ].join(''));
        },
        trapezoid: function(opts) {
            const b1L = opts.b1Label || opts.b1 || 'b\u2081';
            const b2L = opts.b2Label || opts.b2 || 'b\u2082';
            const hL = opts.heightLabel || opts.height || 'h';
            return svg(280, 180, [
                `<polygon points="20,140 260,140 200,40 80,40" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                // top base
                txt(140, 30, b1L),
                // bottom base
                txt(140, 158, b2L),
                // height line
                `<line x1="80" y1="40" x2="80" y2="140" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="4 3"/>`,
                rightAngle(80, 140, 1, -1),
                txt(70, 95, hL, {anchor:'end', color: DIM}),
            ].join(''));
        },
        rectangularPrism: function(opts) {
            // pseudo-3D box: front face + offset back edges
            const lL = opts.lengthLabel || opts.length || 'l';
            const wL = opts.widthLabel || opts.width || 'w';
            const hL = opts.heightLabel || opts.height || 'h';
            return svg(300, 200, [
                // back face (offset)
                `<polygon points="60,30 240,30 240,130 60,130" fill="none" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="3 3"/>`,
                // front face
                `<rect x="30" y="60" width="180" height="100" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                // connecting edges
                `<line x1="30" y1="60" x2="60" y2="30" stroke="${STROKE}" stroke-width="2"/>`,
                `<line x1="210" y1="60" x2="240" y2="30" stroke="${STROKE}" stroke-width="2"/>`,
                `<line x1="210" y1="160" x2="240" y2="130" stroke="${STROKE}" stroke-width="2"/>`,
                `<line x1="30" y1="160" x2="60" y2="130" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="3 3"/>`,
                // labels
                txt(120, 178, lL),
                txt(20, 115, hL, {anchor:'end'}),
                txt(228, 50, wL, {color: DIM, anchor:'start'}),
            ].join(''));
        },
        cube: function(opts) {
            const sL = opts.sideLabel || opts.side || 's';
            return svg(260, 220, [
                `<polygon points="50,40 200,40 200,170 50,170" fill="none" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="3 3"/>`,
                `<rect x="20" y="70" width="150" height="130" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`,
                `<line x1="20" y1="70" x2="50" y2="40" stroke="${STROKE}" stroke-width="2"/>`,
                `<line x1="170" y1="70" x2="200" y2="40" stroke="${STROKE}" stroke-width="2"/>`,
                `<line x1="170" y1="200" x2="200" y2="170" stroke="${STROKE}" stroke-width="2"/>`,
                `<line x1="20" y1="200" x2="50" y2="170" stroke="${STROKE}" stroke-width="1.5" stroke-dasharray="3 3"/>`,
                txt(95, 215, sL),
                txt(10, 140, sL, {anchor:'end'}),
            ].join(''));
        },
        coordinatePlane: function(opts) {
            // Plot points list: [{x, y, label}]
            const points = opts.points || [];
            const range = opts.range || 6;
            const size = 240, mid = size / 2, step = mid / range;
            const lines = [];
            // grid
            for (let i = -range; i <= range; i++) {
                const x = mid + i * step;
                lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${size}" stroke="#e0e0e0" stroke-width="1"/>`);
                lines.push(`<line x1="0" y1="${x}" x2="${size}" y2="${x}" stroke="#e0e0e0" stroke-width="1"/>`);
            }
            // axes
            lines.push(`<line x1="0" y1="${mid}" x2="${size}" y2="${mid}" stroke="#333" stroke-width="2"/>`);
            lines.push(`<line x1="${mid}" y1="0" x2="${mid}" y2="${size}" stroke="#333" stroke-width="2"/>`);
            // axis tick labels
            lines.push(txt(size - 6, mid - 4, 'x', {color: DIM, anchor:'end', size:11}));
            lines.push(txt(mid + 6, 12, 'y', {color: DIM, anchor:'start', size:11}));
            // points
            points.forEach(p => {
                const px = mid + p.x * step, py = mid - p.y * step;
                lines.push(`<circle cx="${px}" cy="${py}" r="5" fill="#e53935" stroke="#fff" stroke-width="2"/>`);
                if (p.label) lines.push(txt(px + 8, py - 8, p.label, {color:'#c62828', anchor:'start', size:12}));
            });
            return svg(size, size, lines.join(''));
        }
    };

    window.mathShapes = shapes;
})();
