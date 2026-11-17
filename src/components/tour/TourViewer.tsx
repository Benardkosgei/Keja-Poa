import { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Layers, Info, X } from 'lucide-react';
import type { TourScene, TourHotspot, TourTag } from '@/types';

interface TourViewerProps {
  scenes: TourScene[];
  initialSceneId?: string;
  onSceneChange?: (sceneId: string) => void;
}

// 3D Tour Viewer Component using Three.js concepts (Canvas-based for React)
export function TourViewer({ scenes, initialSceneId, onSceneChange }: TourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentScene, setCurrentScene] = useState<TourScene | null>(
    scenes.find(s => s.id === initialSceneId) || scenes[0] || null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [activeTag, setActiveTag] = useState<TourTag | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  // Initialize
  useEffect(() => {
    if (scenes.length > 0 && !currentScene) {
      const initial = scenes.find(s => s.id === initialSceneId) || scenes[0];
      setCurrentScene(initial);
    }
    setIsLoading(false);
  }, [scenes, currentScene, initialSceneId]);

  // Handle mouse/touch drag for looking around
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.3,
      y: prev.y + deltaX * 0.3,
    }));

    dragStart.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - dragStart.current.x;
    const deltaY = e.touches[0].clientY - dragStart.current.y;

    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x + deltaY * 0.3)),
      y: prev.y + deltaX * 0.3,
    }));

    dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Navigate to scene
  const navigateToScene = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
      setCurrentScene(scene);
      setRotation({ x: 0, y: 0 });
      onSceneChange?.(sceneId);
    }
  }, [scenes, onSceneChange]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  // Reset view
  const handleReset = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!currentScene) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
        <p>No tour scenes available</p>
      </div>
    );
  }

  // Calculate hotspot positions on screen
  const getHotspotStyle = (hotspot: TourHotspot) => {
    // Normalize position for a sphere panorama view
    const normalizedX = (hotspot.position.x + 5) / 10;
    const normalizedY = (hotspot.position.y + 2) / 4;

    // Apply rotation to hotspot visibility
    const rotatedX = normalizedX - (rotation.y / 360);
    const visible = rotatedX > -0.2 && rotatedX < 1.2;

    return {
      left: `${rotatedX * 100}%`,
      top: `${normalizedY * 100}%`,
      display: visible ? 'flex' : 'none',
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white">Loading tour...</span>
          </div>
        </div>
      )}

      {/* Panorama Image with transformations */}
      <div
        className="absolute inset-0 transition-transform duration-100"
        style={{
          transform: `scale(${zoom}) rotateX(${-rotation.x}deg) rotateY(${rotation.y}deg)`,
          perspective: '1000px',
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentScene.panorama_url})`,
            backgroundSize: 'cover',
          }}
        />
        {/* Gradient overlay for better hotspot visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
      </div>

      {/* Hotspots */}
      {currentScene.hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          className="absolute group z-20"
          style={getHotspotStyle(hotspot)}
          onClick={(e) => {
            e.stopPropagation();
            navigateToScene(hotspot.target_scene);
          }}
        >
          <div className="relative">
            {/* Hotspot ring animation */}
            <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />

            {/* Hotspot icon */}
            <div className="relative w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Label tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                {hotspot.label}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
              </div>
            </div>
          </div>
        </button>
      ))}

      {/* Info Tags */}
      {currentScene.tags.map((tag) => {
        const normalizedX = (tag.position.x + 5) / 10;
        const normalizedY = (tag.position.y + 2) / 4;

        return (
          <button
            key={tag.id}
            className="absolute z-20 group"
            style={{
              left: `${normalizedX * 100}%`,
              top: `${normalizedY * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => setActiveTag(tag)}
          >
            <div className="w-8 h-8 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
              <Info className="w-4 h-4 text-white" />
            </div>

            {/* Label */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                {tag.title}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-600" />
              </div>
            </div>
          </button>
        );
      })}

      {/* Active Tag Modal */}
      {activeTag && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50" onClick={() => setActiveTag(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">{activeTag.title}</h3>
              <button
                onClick={() => setActiveTag(null)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <p className="text-slate-600">{activeTag.description}</p>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="max-w-4xl mx-auto">
          {/* Scene Name */}
          <div className="text-center mb-4">
            <h3 className="text-white font-semibold text-lg">{currentScene.name}</h3>
            <p className="text-white/70 text-sm">Drag to look around • Click hotspots to navigate</p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>

            <div className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
              {Math.round(zoom * 100)}%
            </div>

            <button
              onClick={handleZoomIn}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>

            <div className="w-px h-8 bg-white/30 mx-2" />

            {/* Reset View */}
            <button
              onClick={handleReset}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-5 h-5 text-white" />
            </button>

            <div className="w-px h-8 bg-white/30 mx-2" />

            {/* Mini Map Toggle */}
            <button
              onClick={() => setShowMiniMap(!showMiniMap)}
              className={`p-3 rounded-full transition-colors ${showMiniMap ? 'bg-blue-600' : 'bg-white/20 hover:bg-white/30'}`}
              title="Floor Plan"
            >
              <Layers className="w-5 h-5 text-white" />
            </button>

            <div className="w-px h-8 bg-white/30 mx-2" />

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Scene Navigation */}
          <div className="flex items-center justify-center mt-4 space-x-4">
            <button
              onClick={() => {
                const currentIndex = scenes.findIndex(s => s.id === currentScene.id);
                if (currentIndex > 0) {
                  navigateToScene(scenes[currentIndex - 1].id);
                }
              }}
              disabled={scenes.findIndex(s => s.id === currentScene.id) === 0}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="flex space-x-2">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => navigateToScene(scene.id)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    scene.id === currentScene.id ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  title={scene.name}
                />
              ))}
            </div>

            <button
              onClick={() => {
                const currentIndex = scenes.findIndex(s => s.id === currentScene.id);
                if (currentIndex < scenes.length - 1) {
                  navigateToScene(scenes[currentIndex + 1].id);
                }
              }}
              disabled={scenes.findIndex(s => s.id === currentScene.id) === scenes.length - 1}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Scene Labels */}
          <div className="flex items-center justify-center mt-3 space-x-2 flex-wrap">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => navigateToScene(scene.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  scene.id === currentScene.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                {scene.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini Map Overlay */}
      {showMiniMap && (
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl max-w-xs">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Floor Plan</h4>
          <div className="relative w-full aspect-square bg-slate-100 rounded-lg">
            {scenes.map((scene, index) => {
              // Simple grid layout for mini map
              const cols = Math.ceil(Math.sqrt(scenes.length));
              const row = Math.floor(index / cols);
              const col = index % cols;

              return (
                <button
                  key={scene.id}
                  onClick={() => navigateToScene(scene.id)}
                  className={`absolute w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    scene.id === currentScene.id
                      ? 'bg-blue-600 text-white scale-110'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  style={{
                    left: `${(col / cols) * 100 + 10}%`,
                    top: `${(row / Math.ceil(scenes.length / cols)) * 100 + 10}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  title={scene.name}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {scenes.findIndex(s => s.id === currentScene.id) + 1} of {scenes.length} scenes
          </p>
        </div>
      )}
    </div>
  );
}

// Tour Builder Component (for creating tours)
interface TourBuilderProps {
  propertyId: number;
  scenes: TourScene[];
  onSave: (tourData: any) => void;
}

export function TourBuilder({ propertyId, scenes, onSave }: TourBuilderProps) {
  const [title, setTitle] = useState('Virtual Property Tour');
  const [description, setDescription] = useState('');
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-slate-900 mb-6">Tour Builder</h3>

      {/* Tour Details */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tour Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        </div>
      </div>

      {/* Scene List */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Scenes ({scenes.length})</h4>
        <div className="space-y-2">
          {scenes.map((scene, index) => (
            <div
              key={scene.id}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedScene === scene.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 hover:bg-slate-100'
              }`}
              onClick={() => setSelectedScene(scene.id)}
            >
              <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                <img src={scene.panorama_url} alt={scene.name} className="w-full h-full object-cover" />
              </div>
              <div className="ml-3 flex-1">
                <p className="font-medium text-slate-900">{scene.name}</p>
                <p className="text-sm text-slate-500">{scene.hotspots.length} hotspots • {scene.tags.length} tags</p>
              </div>
              <div className="text-sm text-slate-400">#{index + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
          Add Scene
        </button>
        <button
          onClick={() => onSave({ title, description, propertyId })}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Save Tour
        </button>
      </div>
    </div>
  );
}

export default { TourViewer, TourBuilder };