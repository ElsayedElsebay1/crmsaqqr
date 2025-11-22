import React, { useState, useRef, useMemo } from 'react';
import { DashboardPreferences, WidgetKey } from '../types';
import AnalyticsGrid from '../components/dashboard/AnalyticsGrid';
import ProjectsStatusChart from '../components/dashboard/ProjectsStatusChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import QuickStats from '../components/dashboard/QuickStats';
import ProjectStatusSummary from '../components/dashboard/ProjectStatusSummary';
import SalesFunnelWidget from '../components/dashboard/SalesFunnelWidget';
import DashboardCustomizationModal from '../components/dashboard/DashboardCustomizationModal';
import { SlidersIcon } from '../components/icons/SlidersIcon';
import { useStore } from '../store/store';

interface DashboardPageProps {}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const {
    deals,
    leads,
    projects,
    invoices,
    activityLog,
    tasks,
    preferences,
    saveDashboardPreferences,
    currentUser,
  } = useStore(state => ({
    deals: state.deals,
    leads: state.leads,
    projects: state.projects,
    invoices: state.invoices,
    activityLog: state.activityLog,
    tasks: state.tasks,
    preferences: state.dashboardPreferences,
    saveDashboardPreferences: state.saveDashboardPreferences,
    currentUser: state.currentUser!,
  }));

  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const dragItemIndex = useRef<number | null>(null);
  const dragCounter = useRef(0);

  const visibleOrderedWidgets = useMemo(() => {
    return preferences.order.filter(key => preferences.widgets[key]);
  }, [preferences]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItemIndex.current = index;
    const currentTarget = e.currentTarget;
    // A slight delay to allow the browser to create the drag image
    setTimeout(() => {
        currentTarget.classList.add('dragging-widget');
    }, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    if (index !== dragItemIndex.current) {
        setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
        setDragOverIndex(null);
    }
  };
  
  const handleDrop = (dropIndex: number) => {
    if (dragItemIndex.current === null || dragItemIndex.current === dropIndex) {
      return;
    }

    const newOrder = [...preferences.order];
    const dragVisibleKey = visibleOrderedWidgets[dragItemIndex.current];
    const dropVisibleKey = visibleOrderedWidgets[dropIndex];

    const dragMasterIndex = newOrder.indexOf(dragVisibleKey);
    const dropMasterIndex = newOrder.indexOf(dropVisibleKey);

    const [draggedItem] = newOrder.splice(dragMasterIndex, 1);
    newOrder.splice(dropMasterIndex, 0, draggedItem);
    
    saveDashboardPreferences({
        ...preferences,
        order: newOrder,
    });
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Cleanup
    e.currentTarget.classList.remove('dragging-widget');
    dragItemIndex.current = null;
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const widgetComponents: Record<WidgetKey, React.ReactNode> = {
    quickStats: <QuickStats deals={deals} invoices={invoices} tasks={tasks} />,
    projectStatusSummary: <ProjectStatusSummary projects={projects} tasks={tasks} />,
    analyticsGrid: <AnalyticsGrid deals={deals} leads={leads} invoices={invoices} />,
    salesFunnel: <SalesFunnelWidget deals={deals} />,
    projectsStatusChart: <div className="min-h-[400px]"><ProjectsStatusChart projects={projects} /></div>,
    recentActivity: <RecentActivity activityLog={activityLog} />,
    upcomingDeadlines: <UpcomingDeadlines deals={deals} tasks={tasks} projects={projects} />,
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-1">
                مرحباً بعودتك، {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-slate-400">هنا نظرة شاملة على أداء الشركة بالكامل.</p>
          </div>
          <button
            onClick={() => setIsCustomizeModalOpen(true)}
            className="btn btn-secondary"
            aria-label="Customize Dashboard"
          >
            <SlidersIcon className="w-5 h-5" />
            <span>تخصيص</span>
          </button>
        </div>
        
        {visibleOrderedWidgets.map((widgetKey, index) => {
            const isBeingDraggedOver = dragOverIndex === index;
            return (
                <div
                    key={widgetKey}
                    className={`widget-container cursor-move ${isBeingDraggedOver ? 'drag-over-widget' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {widgetComponents[widgetKey]}
                </div>
            )
        })}

      </div>

      <DashboardCustomizationModal 
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />
    </>
  );
};

export default DashboardPage;