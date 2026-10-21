import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GraphicComponent, GridComponent, TooltipComponent } from 'echarts/components';
import type { EChartsCoreOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
export type ChartRow = { id: string; label: string; [key: string]: string | number };
export type ChartSeries = { id: string; label: string; color: string };
const count = (n: number) => new Intl.NumberFormat('ar-SY').format(n);
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
  );
@Component({
  selector: 'app-chart',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `<div
    echarts
    dir="ltr"
    [options]="options()"
    [initOpts]="{ renderer: 'svg' }"
    [autoResize]="true"
    (chartClick)="clicked($event)"
    class="h-full! w-full"
    role="img"
    [attr.aria-label]="label()"
  ></div>`,
})
export class AppChart {
  readonly frameHeight = signal(320);
  readonly plotHeight = signal(264);
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const frame = element.parentElement;
      if (!frame) return;
      const measure = () => {
        this.frameHeight.set(frame.getBoundingClientRect().height);
        this.plotHeight.set(element.getBoundingClientRect().height);
      };
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      observer.observe(frame);
      measure();
      destroy.onDestroy(() => observer.disconnect());
    });
    echarts.use([
      LineChart,
      PieChart,
      BarChart,
      GridComponent,
      TooltipComponent,
      GraphicComponent,
      SVGRenderer,
    ]);
  }
  readonly kind = input<'area' | 'line' | 'donut' | 'radial' | 'bar'>('area');
  readonly data = input.required<readonly ChartRow[]>();
  readonly series = input.required<readonly ChartSeries[]>();
  readonly hidden = input<readonly string[]>([]);
  readonly primary = input(false);
  readonly expanded = input(false);
  readonly label = input('رسم بياني');
  readonly drill = output<{ id: string; series?: string }>();
  readonly options = computed<EChartsCoreOption>(() => {
    const kind = this.kind(),
      data = this.data(),
      series = this.series(),
      hidden = this.hidden();
    const color = (value: string) =>
      value.startsWith('--')
        ? getComputedStyle(document.documentElement).getPropertyValue(value).trim()
        : value;
    const visible = series.filter((s) => !hidden.includes(s.id));
    const total = data.reduce((sum, row) => sum + Number(row.count || 0), 0);
    const common = {
      animation: false,
      textStyle: { fontFamily: 'Alexandria', fontSize: 12, color: color('--chart-axis') },
      tooltip: {
        trigger: kind === 'donut' || kind === 'radial' ? 'item' : 'axis',
        confine: true,
        valueFormatter: (value: unknown) =>
          count(Number(value)) +
          ' ' +
          (kind === 'line' ? 'مستخدم' : 'معاملة') +
          (kind === 'donut' && total > 0
            ? ' · ' +
              new Intl.NumberFormat('ar-SY', { style: 'percent', maximumFractionDigits: 1 }).format(
                Number(value) / total,
              )
            : ''),
        ...(kind === 'radial'
          ? {
              formatter: (parameter: { data?: { id?: string } }) => {
                const row = data.find((entry) => entry.id === parameter.data?.id);
                if (!row) return '';
                return `<div dir="rtl" class="min-w-36 text-sm"><p class="mb-2 font-medium">${escapeHtml(row.label)}</p>${visible.map((entry) => `<p class="flex justify-between gap-5"><span>${escapeHtml(entry.label)}</span><b class="tabular-nums">${count(Number(row[entry.id] || 0))} معاملة</b></p>`).join('')}</div>`;
              },
            }
          : {}),
        backgroundColor: color('--popover'),
        borderColor: color('--border'),
        textStyle: { fontFamily: 'Alexandria', fontSize: 14, color: color('--foreground') },
        padding: 12,
        extraCssText: 'direction:rtl;text-align:right;border-radius:12px;',
      },
    };
    if (kind === 'donut') {
      const total = data.reduce((n, d) => n + Number(d.count || 0), 0);
      return {
        ...common,
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: this.frameHeight() * 0.4 - 28,
            style: { text: count(total), font: '700 28px Alexandria', fill: color('--foreground') },
          },
          {
            type: 'text',
            left: 'center',
            top: this.frameHeight() * 0.49 - 14,
            style: {
              text: 'معاملة في الفترة',
              font: '14px Alexandria',
              fill: color('--muted-foreground'),
            },
          },
        ],
        series: [
          {
            type: 'pie',
            left: 5,
            right: 5,
            top: 5,
            bottom: 5,
            radius: ['52%', '76%'],
            center: ['50%', '50%'],
            startAngle: 0,
            clockwise: false,
            padAngle: 3,
            avoidLabelOverlap: true,
            label: { show: false },
            itemStyle: { borderColor: color('--card'), borderWidth: 3, borderRadius: 5 },
            data: data
              .filter((d) => !hidden.includes(d.id))
              .map((d) => ({
                id: d.id,
                name: d.label,
                value: Number(d.count),
                itemStyle: {
                  color: color(series.find((s) => s.id === d.id)?.color || '--chart-1'),
                },
              })),
          },
        ],
      };
    }
    if (kind === 'radial') {
      const total = data.reduce(
        (n, d) => n + series.reduce((sum, s) => sum + Number(d[s.id] || 0), 0),
        0,
      );
      const maximum = Math.max(
        1,
        ...data.map((d) => series.reduce((sum, s) => sum + Number(d[s.id] || 0), 0)),
      );
      return {
        ...common,
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: this.plotHeight() / 2 - 32,
            style: { text: count(total), font: '700 28px Alexandria', fill: color('--foreground') },
          },
          {
            type: 'text',
            left: 'center',
            top: this.plotHeight() / 2 + 6,
            style: { text: 'معاملة', font: '14px Alexandria', fill: color('--muted-foreground') },
          },
        ],
        series: data.map((d, i) => ({
          type: 'pie',
          name: d.label,
          radius: [`${42 + i * 16}%`, `${54 + i * 16}%`],
          label: { show: false },
          startAngle: 90,
          clockwise: true,
          silent: false,
          itemStyle: { borderRadius: 5, borderColor: color('--card'), borderWidth: 1 },
          data: [
            ...visible.map((s) => ({
              id: d.id,
              name: d.label + ' · ' + s.label,
              value: Number(d[s.id] || 0),
              itemStyle: { color: color(s.color) },
            })),
            {
              name: '',
              value: maximum - visible.reduce((n, s) => n + Number(d[s.id] || 0), 0),
              itemStyle: { color: color('--muted') },
              tooltip: { show: false },
            },
          ],
        })),
      };
    }
    return {
      ...common,
      grid: { top: 12, right: 12, bottom: 30, left: 45, containLabel: false },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.label),
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: color('--chart-axis'),
          fontFamily: 'Alexandria',
          hideOverlap: true,
          margin: 8,
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        minInterval: 1,
        axisLabel: { formatter: (value: number) => count(value), color: color('--chart-axis') },
        splitLine: { lineStyle: { color: color('--chart-grid'), type: [3, 5] } },
      },
      series: visible.map((s) => ({
        name: s.label,
        type: kind === 'bar' ? 'bar' : 'line',
        data: data.map((d) => ({ id: d.id, value: Number(d[s.id] || 0) })),
        smooth: 0.35,
        showSymbol: kind === 'line',
        symbolSize: 6,
        itemStyle: { color: color(s.color) },
        lineStyle: { width: 3, color: color(s.color) },
        ...(kind === 'area'
          ? {
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: color(s.color) + '47' },
                  { offset: 1, color: color(s.color) + '05' },
                ]),
              },
            }
          : {}),
      })),
    };
  });
  clicked(event: { data?: unknown; name?: string; seriesName?: string }) {
    if (
      event.data &&
      typeof event.data === 'object' &&
      'id' in event.data &&
      typeof event.data.id === 'string'
    )
      this.drill.emit({ id: event.data.id, series: event.seriesName });
  }
}
