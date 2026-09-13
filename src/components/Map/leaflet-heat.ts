// @ts-nocheck
import L from 'leaflet';

/**
 * Adaptador de SimpleHeat integrado para Leaflet (Cero dependencias npm obsoletas).
 * Basado en la implementación de Leaflet.heat y optimizado para TypeScript y Next.js.
 */
function simpleheat(canvas: HTMLCanvasElement) {
  return new (simpleheat as any).init(canvas);
}

(simpleheat as any).init = function (canvas: HTMLCanvasElement) {
  this._canvas = canvas;
  this._ctx = canvas.getContext('2d');
  this._width = canvas.width;
  this._height = canvas.height;
  this._max = 1;
  this._data = [];
};

(simpleheat as any).init.prototype = {
  defaultRadius: 25,
  defaultGradient: {
    0.3: '#06B6D4',
    0.5: '#10B981',
    0.7: '#F4CA19',
    0.85: '#F97316',
    1.0: '#EF4444',
  },

  data: function (data: [number, number, number][]) {
    this._data = data;
    return this;
  },

  max: function (max: number) {
    this._max = max;
    return this;
  },

  add: function (point: [number, number, number]) {
    this._data.push(point);
    return this;
  },

  clear: function () {
    this._data = [];
    return this;
  },

  radius: function (r: number, blur = 15) {
    const circle = (this._circle = document.createElement('canvas'));
    const ctx = circle.getContext('2d')!;
    const r2 = (this._r = r + blur);

    circle.width = circle.height = r2 * 2;
    ctx.shadowOffsetX = ctx.shadowOffsetY = 200;
    ctx.shadowBlur = blur;
    ctx.shadowColor = 'black';

    ctx.beginPath();
    ctx.arc(r2 - 200, r2 - 200, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    return this;
  },

  gradient: function (grad: Record<number, string>) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (const i in grad) {
      gradient.addColorStop(+i, grad[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    this._grad = ctx.getImageData(0, 0, 1, 256).data;
    return this;
  },

  draw: function (minOpacity = 0.05) {
    if (!this._circle) this.radius(this.defaultRadius);
    if (!this._grad) this.gradient(this.defaultGradient);

    const ctx = this._ctx;
    ctx.clearRect(0, 0, this._width, this._height);

    for (let i = 0, len = this._data.length, p; i < len; i++) {
      p = this._data[i];
      ctx.globalAlpha = Math.max(p[2] / this._max, minOpacity);
      ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
    }

    const colored = ctx.getImageData(0, 0, this._width, this._height);
    this._colorize(colored.data, this._grad);
    ctx.putImageData(colored, 0, 0);

    return this;
  },

  _colorize: function (pixels: Uint8ClampedArray, gradient: Uint8ClampedArray) {
    for (let i = 0, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i + 3] * 4;
      if (j) {
        pixels[i] = gradient[j];
        pixels[i + 1] = gradient[j + 1];
        pixels[i + 2] = gradient[j + 2];
      }
    }
  },
};

export function createHeatLayer(latlngs: [number, number, number][], options: any = {}) {
  const HeatLayer = (L.Layer ? L.Layer : (L as any).Class).extend({
    initialize: function (latlngs: [number, number, number][], options: any) {
      this._latlngs = latlngs;
      L.setOptions(this, options);
    },

    setLatLngs: function (latlngs: [number, number, number][]) {
      this._latlngs = latlngs;
      return this.redraw();
    },

    redraw: function () {
      if (this._heat && !this._frame && this._map && !this._map._animating) {
        this._frame = L.Util.requestAnimFrame(this._redraw, this);
      }
      return this;
    },

    onAdd: function (map: any) {
      this._map = map;
      if (!this._canvas) {
        this._initCanvas();
      }
      map._panes.overlayPane.appendChild(this._canvas);
      map.on('moveend', this._reset, this);
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
      }
      this._reset();
    },

    onRemove: function (map: any) {
      map.getPanes().overlayPane.removeChild(this._canvas);
      map.off('moveend', this._reset, this);
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.off('zoomanim', this._animateZoom, this);
      }
    },

    _initCanvas: function () {
      const canvas = (this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer leaflet-layer'));
      const size = this._map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      const animated = this._map.options.zoomAnimation && L.Browser.any3d;
      L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

      this._heat = simpleheat(canvas);
      this._heat.radius(this.options.radius || 25, this.options.blur || 15);
      if (this.options.max) this._heat.max(this.options.max);
    },

    _animateZoom: function (e: any) {
      const scale = this._map.getZoomScale(e.zoom);
      const offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale)._add(this._map._getMapPanePos());
      if (L.DomUtil.setTransform) {
        L.DomUtil.setTransform(this._canvas, offset, scale);
      } else {
        this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
      }
    },

    _reset: function () {
      const topLeft = this._map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(this._canvas, topLeft);

      const size = this._map.getSize();
      if (this._heat._width !== size.x) {
        this._canvas.width = this._heat._width = size.x;
      }
      if (this._heat._height !== size.y) {
        this._canvas.height = this._heat._height = size.y;
      }
      this._redraw();
    },

    _redraw: function () {
      if (!this._map) return;
      const data: [number, number, number][] = [];
      const r = this._heat._r;
      const size = this._map.getSize();
      const bounds = new L.Bounds(L.point([-r, -r]), size.add([r, r]));

      for (let i = 0; i < this._latlngs.length; i++) {
        const p = this._map.latLngToContainerPoint(this._latlngs[i]);
        if (bounds.contains(p)) {
          data.push([Math.round(p.x), Math.round(p.y), this._latlngs[i][2] || 1]);
        }
      }

      this._heat.data(data).draw(this.options.minOpacity || 0.05);
      this._frame = null;
    },
  });

  return new (HeatLayer as any)(latlngs, options);
}
