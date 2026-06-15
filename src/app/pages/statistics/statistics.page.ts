import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, arrowDown, arrowUpOutline, barChartOutline, calendarOutline, cashOutline, flashOutline, peopleOutline, pulseOutline, starOutline, timeOutline, trendingDownOutline, trendingUpOutline, trophyOutline } from 'ionicons/icons';
import { RidesService } from 'src/app/services/rides.service';
import { ChartBar, InsightItem, StatPeriod } from 'src/app/interface/statistics';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonButton, IonIcon, IonRefresher, IonRefresherContent]
})
export class StatisticsPage implements OnInit {

  private _ridesService: RidesService = inject(RidesService);

  headerSolid = false;
  activePeriod: 'week' | 'month' | 'year' = 'month';
  isLoading = true;

  periods: StatPeriod[] = [
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' },
    { label: 'Año', value: 'year' }
  ];

  kpis = [
    { label: 'Ganancias', value: '$1,240', change: '+12.5%', icon: 'cash-outline', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Viajes', value: '24', change: '+8.2%', icon: 'flash-outline', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Pasajeros', value: '68', change: '+15.3%', icon: 'people-outline', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: 'Rating', value: '4.8', change: '+0.2', icon: 'star-outline', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
  ];

  weeklyBars: ChartBar[] = [
    { label: 'Lun', value: 65, color: '#3b82f6' },
    { label: 'Mar', value: 82, color: '#3b82f6' },
    { label: 'Mié', value: 45, color: '#3b82f6' },
    { label: 'Jue', value: 90, color: '#10b981' },
    { label: 'Vie', value: 72, color: '#3b82f6' },
    { label: 'Sáb', value: 95, color: '#10b981' },
    { label: 'Dom', value: 55, color: '#3b82f6' }
  ];

  insights: InsightItem[] = [
    {
      icon: 'trophy-outline', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
      title: 'Día más productivo', description: 'Sábado con 5 viajes completados', trend: 'up', percent: 28
    },
    {
      icon: 'time-outline', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
      title: 'Horario pico', description: '08:00 - 10:00 AM, mayor demanda', trend: 'up', percent: 42
    },
    {
      icon: 'pulse-outline', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',
      title: 'Ruta estrella', description: 'Palermo → Ezeiza, 12 repeticiones', trend: 'neutral', percent: 0
    }
  ];

  activityDays = Array.from({ length: 35 }, (_, i) => ({
    day: i + 1,
    intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0
  }));

  constructor() {
    addIcons({
      arrowBackOutline, trendingUpOutline, trendingDownOutline, calendarOutline,
      cashOutline, peopleOutline, starOutline, timeOutline, arrowUpOutline,
      flashOutline, trophyOutline, pulseOutline, barChartOutline, arrowDown
    });
  }

  ngOnInit() {
    this.loadRidesStatistics();
  }

  onScroll(ev: any) {
    this.headerSolid = ev.detail.scrollTop > 60;
  }

  scrollToTop() {
    document.querySelector('ion-content')?.scrollToTop(500);
  }

  back() {
    history.back();
  }

  async loadRidesStatistics(refresh = false) {
    if (refresh) {
      this.isLoading = true;
      //this.currentPage = 1;
      /* this.rides = [];
      this.filteredRides = []; */
      //this.activePeriod = 'week';
      this.kpis = [];
      this.weeklyBars = [];
      this.insights = [];
      this.activityDays = [];
    }
    try {
      const data = {
        period: this.activePeriod,
      };
      const res = await this._ridesService.getStats(data);
      console.log(res);
      this.activePeriod = res.data.period;
      this.kpis = res.data.kpis;
      this.weeklyBars = res.data.weekly_chart;
      this.insights = res.data.insights;
      this.activityDays = res.data.heatmap;
      //this.stats = res.data.stats;
      this.isLoading = false;
    } catch (error) {
      console.log(error);
    }
  }

  async handleRefresh(ev: any) {
    await this.randomizeDataAsync();
    ev.target.complete();
  }

  async randomizeDataAsync() {
    this.isLoading = true;
    await new Promise(r => setTimeout(r, 400));
    this.randomizeData();
    this.isLoading = false;
  }

  setPeriod(period: string) {
    this.activePeriod = period as 'week' | 'month' | 'year';
    this.randomizeData();
  }

  randomizeData() {
    this.loadRidesStatistics(true);
  }

  getTrendIcon(trend: string): string {
    return trend === 'up' ? 'trending-up-outline' : trend === 'down' ? 'trending-down-outline' : 'remove-outline';
  }

}
