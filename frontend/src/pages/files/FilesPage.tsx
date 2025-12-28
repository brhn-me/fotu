import { useState, useMemo, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { Folder, FileText, Image, Film, ChevronRight, HardDrive, LayoutGrid, List as ListIcon, Info, Pencil, Clock, Trash2, ExternalLink, Move } from "lucide-react";
import styles from "./FilesPage.module.css";
import { MetadataEditorModal } from "./MetadataEditorModal";
import { ChangeLocationModal } from "./ChangeLocationModal";
import { FixDateTimeModal } from "./FixDateTimeModal";
import { FilePropertiesModal } from './FilePropertiesModal';

// --- Mock Data ---

export interface FileNode {
    id: string;
    name: string;
    type: 'folder' | 'image' | 'video' | 'file';
    size?: string;
    modified?: string;
    children?: FileNode[];
    metadata?: Record<string, any>; // Added metadata field
}

export type FileItem = FileNode;

interface Source {
    id: string;
    name: string;
    type: 'local' | 'network';
    capacity: string;
}

const MOCK_SOURCES: Source[] = [
    { id: 'src-1', name: 'Main Library', type: 'local', capacity: '2TB' },
    { id: 'src-2', name: 'External Backup', type: 'network', capacity: '500GB' },
    { id: 'src-3', name: 'SD Card Import', type: 'local', capacity: '64GB' },
];

// Enriched Mock Data
const MOCK_FILE_TREE: Record<string, FileNode[]> = {
    'src-1': [
        {
            id: 'f1', name: 'Photos', type: 'folder', children: [
                {
                    id: 'f1-1', name: '2023_Holidays', type: 'folder', children: [
                        { id: 'img1', name: 'Beach_Sunset.jpg', type: 'image', size: '4.2 MB', modified: '2023-12-20', metadata: { camera: 'Canon EOS R5', location: { lat: 20.7984, lng: -156.3319 }, tags: ['sunset', 'beach'] } },
                        { id: 'img2', name: 'Family_Dinner.jpg', type: 'image', size: '3.8 MB', modified: '2023-12-20', metadata: { camera: 'iPhone 14 Pro', location: { lat: 51.505, lng: -0.09 }, tags: ['family'] } },
                        { id: 'vid1', name: 'Fireworks.mp4', type: 'video', size: '150 MB', modified: '2023-12-21', metadata: { resolution: '1080p', duration: '0:02:30' } },
                        { id: 'img3', name: 'Hotel_View.png', type: 'image', size: '2.1 MB', modified: '2023-12-22', metadata: { camera: 'GoPro Hero 10', location: { lat: 20.7950, lng: -156.3350 }, tags: ['view'] } },
                        { id: 'img4', name: 'Poolside.jpg', type: 'image', size: '3.2 MB', modified: '2023-12-22', metadata: { camera: 'iPhone 14 Pro', location: { lat: 20.7960, lng: -156.3330 } } },
                        { id: 'img5', name: 'Lunch_Spot.jpg', type: 'image', size: '2.8 MB', modified: '2023-12-23', metadata: { camera: 'Canon EOS R5', location: { lat: 20.8000, lng: -156.3300 } } },
                        { id: 'img6', name: 'Hike_Entrance.jpg', type: 'image', size: '4.5 MB', modified: '2023-12-24', metadata: { camera: 'GoPro', location: { lat: 20.7990, lng: -156.3340 } } },
                    ]
                },
                {
                    id: 'f1-2', name: '2022_Trips', type: 'folder', children: [
                        {
                            id: 'f1-2-1', name: 'Paris', type: 'folder', children: [
                                { id: 'p1', name: 'Eiffel_Tower.jpg', type: 'image', size: '5.1 MB', modified: '2022-06-15', metadata: { camera: 'Nikon D850', location: { lat: 48.8584, lng: 2.2945 }, tags: ['landmark'] } },
                                { id: 'p2', name: 'Louvre.jpg', type: 'image', size: '4.9 MB', modified: '2022-06-16', metadata: { camera: 'Nikon D850', location: { lat: 48.8606, lng: 2.3376 }, tags: ['museum'] } },
                            ]
                        },
                        { id: 'f1-2-2', name: 'Tokyo', type: 'folder', children: [] },
                    ]
                },
                { id: 'img_root', name: 'Profile_Pic.jpg', type: 'image', size: '1.2 MB', modified: '2024-01-01', metadata: { camera: 'iPhone 15', tags: ['profile', 'selfie'] } }
            ]
        },
        {
            id: 'f2', name: 'Documents', type: 'folder', children: [
                { id: 'doc1', name: 'Project_Specs.pdf', type: 'file', size: '2.4 MB', modified: '2023-10-05', metadata: { author: 'John Doe', version: '1.2' } },
                { id: 'doc2', name: 'Notes.txt', type: 'file', size: '2 KB', modified: '2023-10-06', metadata: { editor: 'VS Code' } },
                { id: 'doc3', name: 'Budget_2024.xlsx', type: 'file', size: '15 KB', modified: '2023-12-15', metadata: { department: 'Finance', status: 'Final' } },
            ]
        },
        {
            id: 'f3', name: 'Videos', type: 'folder', children: [
                { id: 'v1', name: 'Vlog_Ep1.mov', type: 'video', size: '1.2 GB', modified: '2024-02-10', metadata: { resolution: '4K', duration: '0:15:00', project: 'Travel Vlog' } },
                { id: 'v2', name: 'Tutorial.mp4', type: 'video', size: '450 MB', modified: '2024-02-12', metadata: { resolution: '1080p', duration: '0:08:30', topic: 'React Hooks' } },
            ]
        }
    ],
    'src-2': [
        {
            id: 'b1', name: 'Archive_2021', type: 'folder', children: [
                { id: 'a1', name: 'Backup_Jan.zip', type: 'file', size: '4.5 GB', modified: '2021-02-01', metadata: { type: 'Full Backup' } }
            ]
        },
        { id: 'b2', name: 'Raw_Footage', type: 'folder', children: [] },
    ],
    'src-3': [
        {
            id: 'sd1', name: 'DCIM', type: 'folder', children: [
                {
                    id: 'sd1-1', name: '100CANON', type: 'folder', children: [
                        { id: 'img_001', name: 'IMG_4821.JPG', type: 'image', size: '6.5 MB', modified: '2024-03-01', metadata: { camera: 'Canon EOS 90D', tags: ['nature'] } },
                        { id: 'img_002', name: 'IMG_4822.JPG', type: 'image', size: '6.7 MB', modified: '2024-03-01', metadata: { camera: 'Canon EOS 90D', tags: ['landscape'] } },
                    ]
                }
            ]
        }
    ]
};

// --- Components ---

const SourceCard = ({ source, onClick }: { source: Source; onClick: () => void }) => (
    <div className={styles.sourceCard} onClick={onClick}>
        <div className={styles.sourceIcon}>
            <HardDrive size={32} />
        </div>
        <div className={styles.sourceInfo}>
            <div className={styles.sourceName}>{source.name}</div>
            <div className={styles.sourceDetails}>{source.type} • {source.capacity}</div>
        </div>
        <ChevronRight className={styles.sourceArrow} />
    </div>
);

const FileIcon = ({ type, size = 18 }: { type: FileNode['type']; size?: number }) => {
    switch (type) {
        case 'folder': return <Folder size={size} className={styles.folderIcon} />;
        case 'image': return <Image size={size} />;
        case 'video': return <Film size={size} />;
        default: return <FileText size={size} />;
    }
};

const ContextMenu = ({ x, y, onClose, children }: { x: number; y: number; onClose: () => void; children: React.ReactNode }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div
            className={styles.contextMenu}
            style={{ top: y, left: x }}
            ref={menuRef}
        >
            {children}
        </div>
    );
};

const TreeItem = ({ node, depth = 0, currentPath, onNavigate, pathPrefix, expandedPaths, onToggleExpand }: {
    node: FileNode;
    depth?: number;
    currentPath: string;
    onNavigate: (path: string) => void;
    pathPrefix: string;
    expandedPaths: Set<string>;
    onToggleExpand: (path: string) => void;
}) => {
    const fullPath = `${pathPrefix}/${node.name}`;
    const isExpanded = expandedPaths.has(fullPath);
    const isSelected = currentPath === fullPath;
    const hasSubFolders = node.children?.some(c => c.type === 'folder') ?? false;

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onNavigate(fullPath);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleExpand(fullPath);
    };

    return (
        <div className={styles.treeNode}>
            <div
                className={`${styles.treeLabel} ${isSelected ? styles.selected : ''}`}
                style={{ paddingLeft: depth * 16 + 12 }}
                onClick={handleNavigate}
            >
                {node.type === 'folder' && (
                    <div
                        className={styles.chevronWrapper}
                        onClick={hasSubFolders ? handleToggle : undefined}
                        style={{ cursor: hasSubFolders ? 'pointer' : 'default' }}
                    >
                        <ChevronRight
                            size={14}
                            className={styles.chevron}
                            style={{
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                visibility: hasSubFolders ? 'visible' : 'hidden'
                            }}
                        />
                    </div>
                )}
                {!node.type && <div style={{ width: 14 }} />}
                <FileIcon type={node.type} />
                <span className={styles.nodeName}>{node.name}</span>
            </div>
            {isExpanded && node.children && (
                <div className={styles.treeChildren}>
                    {node.children.filter(c => c.type === 'folder').map(child => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            currentPath={currentPath}
                            onNavigate={onNavigate}
                            pathPrefix={fullPath}
                            expandedPaths={expandedPaths}
                            onToggleExpand={onToggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Views ---

const SourcesSelection = () => {
    const navigate = useNavigate();
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>File Sources</h1>
            <div className={styles.sourcesGrid}>
                {MOCK_SOURCES.map(source => (
                    <SourceCard key={source.id} source={source} onClick={() => navigate(`/files/${source.id}`)} />
                ))}
            </div>
        </div>
    );
};

const FileExplorer = () => {
    const { sourceId, "*": splat } = useParams();
    const navigate = useNavigate();
    const currentPath = splat ? `/${splat}` : "";
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, file: FileNode } | null>(null);

    // Metadata Modal State
    const [editingFile, setEditingFile] = useState<FileNode | null>(null);
    const [fixingDateFile, setFixingDateFile] = useState<FileNode | null>(null);
    const [propertiesFile, setPropertiesFile] = useState<FileNode | null>(null);
    const [renamingFile, setRenamingFile] = useState<FileNode | null>(null);
    const [changingLocationFile, setChangingLocationFile] = useState<FileNode | null>(null);

    // Auto-expand parents on mount/path change
    useMemo(() => {
        if (!splat) return;
        const parts = splat.split('/').filter(Boolean);
        let builtPath = "";
        const newExpanded = new Set(expandedPaths);
        let changed = false;

        parts.forEach(part => {
            builtPath += `/${part}`;
            if (!newExpanded.has(builtPath)) {
                newExpanded.add(builtPath);
                changed = true;
            }
        });

        if (changed) {
            setExpandedPaths(newExpanded);
        }
    }, [splat]);

    // Clear selection on path change
    useEffect(() => {
        setSelectedIds(new Set());
        setContextMenu(null);
    }, [currentPath]);

    const source = MOCK_SOURCES.find(s => s.id === sourceId);
    if (!source) return <div>Source not found</div>;

    const navigateTo = (path: string) => {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        navigate(`/files/${sourceId}/${cleanPath}`);
    };

    const toggleExpand = (path: string) => {
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    // Interaction Handlers
    const handleFileClick = (e: React.MouseEvent, file: FileNode) => {
        e.stopPropagation(); // Prevent clearing selection if we click container

        if (e.metaKey || e.ctrlKey) {
            // Multi-select toggle
            setSelectedIds(prev => {
                const next = new Set(prev);
                if (next.has(file.id)) {
                    next.delete(file.id);
                } else {
                    next.add(file.id);
                }
                return next;
            });
        } else if (e.shiftKey && lastSelectedId) {
            // Range select (simplified: just adds to selection for now)
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.add(file.id);
                return next;
            });
        } else {
            // Single select
            setSelectedIds(new Set([file.id]));
        }
        setLastSelectedId(file.id);
        setContextMenu(null); // Close context menu
    };

    const handleFileDoubleClick = (e: React.MouseEvent, file: FileNode) => {
        e.stopPropagation();
        if (file.type === 'folder') {
            navigateTo(`${currentPath}/${file.name}`);
        } else {
            console.log("Open file:", file.name);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
        e.preventDefault();
        e.stopPropagation();

        // If right-clicked item is not selected, select it (exclusive)
        if (!selectedIds.has(file.id)) {
            setSelectedIds(new Set([file.id]));
            setLastSelectedId(file.id);
        }

        setContextMenu({ x: e.clientX, y: e.clientY, file });
    };

    const handleBackgroundClick = () => {
        setSelectedIds(new Set());
        setContextMenu(null);
    };

    const handleContextMenuAction = (action: string) => {
        if (!contextMenu) return;
        const file = contextMenu.file;

        if (action === 'rename') {
            setRenamingFile(file);
        } else if (action === 'move') {
            setChangingLocationFile(file);
        } else if (action === 'edit-metadata') {
            setEditingFile(file);
        } else if (action === 'fix-date') {
            setFixingDateFile(file);
        } else if (action === 'properties') {
            setPropertiesFile(file);
        } else if (action === 'delete') {
            // In a real app, confirm dialog
            console.log('Delete', file.name);
        }
        setContextMenu(null);
    };

    const handleSaveMetadata = (id: string, updates: any) => {
        console.log("Saving metadata for", id, updates);
        // Optimistic UI update (mock)
        const updateNode = (nodes: FileNode[]) => {
            nodes.forEach(node => {
                if (node.id === id) {
                    node.name = updates.name;
                    node.metadata = { ...node.metadata, ...updates.metadata };
                }
                if (node.children) updateNode(node.children);
            });
        };

        if (sourceId && MOCK_FILE_TREE[sourceId]) {
            updateNode(MOCK_FILE_TREE[sourceId]);
        }
        setEditingFile(null); // Close modal after saving
    };

    const handleSaveDate = (id: string, newDate: string) => {
        console.log(`Saving new date for ${id}: ${newDate}`);
        const updateNode = (nodes: FileNode[]) => {
            nodes.forEach(node => {
                if (node.id === id) {
                    node.modified = newDate;
                    node.metadata = { ...node.metadata, dateCreated: newDate };
                }
                if (node.children) updateNode(node.children);
            });
        };
        if (sourceId && MOCK_FILE_TREE[sourceId]) {
            updateNode(MOCK_FILE_TREE[sourceId]);
        }
        // Force update (react state not deep)
        setEditingFile(null); // Just trigger re-render if needed or rely on parent
    };

    // Helper to find files in current path
    const getFiles = (nodes: FileNode[], pathParts: string[]): FileNode[] => {
        if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === "")) return nodes;
        const [next, ...rest] = pathParts;
        const folder = nodes.find(n => n.name === next);
        if (folder && folder.children) return getFiles(folder.children, rest);
        return [];
    };

    const rootNodes = MOCK_FILE_TREE[sourceId!] || [];
    const currentFiles = getFiles(rootNodes, currentPath.split('/').filter(Boolean));

    return (
        <div className={styles.explorerLayout} onClick={handleBackgroundClick}>
            <div className={styles.treeSidebar} onClick={(e) => e.stopPropagation()}>
                <div className={styles.treeHeader}>
                    <Link to="/files" className={styles.backLink}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Sources</Link>
                    <div className={styles.currentSourceName}><HardDrive size={14} /> {source.name}</div>
                </div>
                <div className={styles.treeContent}>
                    {rootNodes.map(node => (
                        <TreeItem
                            key={node.id}
                            node={node}
                            currentPath={currentPath}
                            onNavigate={navigateTo}
                            pathPrefix=""
                            expandedPaths={expandedPaths}
                            onToggleExpand={toggleExpand}
                        />
                    ))}
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.headerBar} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.breadcrumbs}>
                        <span className={styles.crumbItem} onClick={() => navigateTo("")}>{source.name}</span>
                        {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                                <ChevronRight size={14} className={styles.crumbSep} />
                                <span
                                    className={styles.crumbItem}
                                    onClick={() => navigateTo(arr.slice(0, i + 1).join('/'))}
                                >
                                    {part}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.viewToggle}>
                        <div
                            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <ListIcon size={16} />
                        </div>
                        <div
                            className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <LayoutGrid size={16} />
                        </div>
                    </div>
                </div>

                <div className={styles.contentArea}>
                    {viewMode === 'list' ? (
                        <div className={styles.fileList}>
                            <div className={styles.headerRow}>
                                <div className={styles.colName}>Name</div>
                                <div className={styles.colSize}>Size</div>
                                <div className={styles.colDate}>Modified</div>
                            </div>
                            {currentFiles.map(file => (
                                <div
                                    key={file.id}
                                    className={`${styles.fileRow} ${selectedIds.has(file.id) ? styles.selectedRow : ''}`}
                                    onClick={(e) => handleFileClick(e, file)}
                                    onDoubleClick={(e) => handleFileDoubleClick(e, file)}
                                    onContextMenu={(e) => handleContextMenu(e, file)}
                                >
                                    <div className={styles.colName}>
                                        <div className={styles.iconWrapper}><FileIcon type={file.type} /></div>
                                        {file.name}
                                    </div>
                                    <div className={styles.colSize}>{file.size || '--'}</div>
                                    <div className={styles.colDate}>{file.modified || '--'}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.fileGrid}>
                            {currentFiles.map(file => (
                                <div
                                    key={file.id}
                                    className={`${styles.gridCard} ${selectedIds.has(file.id) ? styles.selectedCard : ''}`}
                                    onClick={(e) => handleFileClick(e, file)}
                                    onDoubleClick={(e) => handleFileDoubleClick(e, file)}
                                    onContextMenu={(e) => handleContextMenu(e, file)}
                                >
                                    <div className={styles.gridPreview}>
                                        {file.type === 'image' || file.type === 'video' ? (
                                            <div className={styles.mediaThumbnail}>
                                                <FileIcon type={file.type} size={48} />
                                            </div>
                                        ) : (
                                            <FileIcon type={file.type} size={48} />
                                        )}
                                    </div>
                                    <div className={styles.gridLabel}>{file.name}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentFiles.length === 0 && (
                        <div className={styles.emptyState}>This folder is empty</div>
                    )}
                </div>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                >
                    <div className={styles.contextMenuItem} onClick={() => handleContextMenuAction('open')}>
                        <ExternalLink size={16} /> Open
                    </div>
                    <div className={styles.contextMenuItem} onClick={() => handleContextMenuAction('rename')}>
                        <Pencil size={16} /> Rename
                    </div>
                    <div className={styles.contextMenuItem} onClick={() => handleContextMenuAction('move')}>
                        <Move size={16} /> Change Location
                    </div>
                    <div className={styles.contextMenuDivider} />
                    <div className={styles.contextMenuItem} onClick={() => handleContextMenuAction('edit-metadata')}>
                        <FileText size={16} /> Edit Metadata
                    </div>
                    <div className={styles.contextMenuItem} onClick={() => handleContextMenuAction('fix-date')}>
                        <Clock size={16} /> Fix Date Time
                    </div>
                    <div className={styles.contextMenuItem} onClick={() => handleContextMenuAction('properties')}>
                        <Info size={16} /> Properties
                    </div>
                    <div className={styles.contextMenuDivider} />
                    <div className={`${styles.contextMenuItem} ${styles.danger}`} onClick={() => handleContextMenuAction('delete')}>
                        <Trash2 size={16} /> Delete
                    </div>
                </ContextMenu>
            )}

            {editingFile && (
                <MetadataEditorModal
                    isOpen={true}
                    onClose={() => setEditingFile(null)}
                    file={editingFile}
                    onSave={handleSaveMetadata}
                />
            )}

            {fixingDateFile && (
                <FixDateTimeModal
                    isOpen={true}
                    onClose={() => setFixingDateFile(null)}
                    file={fixingDateFile}
                    onSave={handleSaveDate}
                />
            )}

            {propertiesFile && (
                <FilePropertiesModal
                    isOpen={true}
                    onClose={() => setPropertiesFile(null)}
                    file={propertiesFile}
                />
            )}

            {changingLocationFile && (
                <ChangeLocationModal
                    isOpen={true}
                    onClose={() => setChangingLocationFile(null)}
                    file={changingLocationFile}
                    siblings={currentFiles}
                    onSave={(id, location) => handleSaveMetadata(id, { metadata: { location } })}
                />
            )}
        </div>
    );
};

export function FilesPage() {
    return (
        <Routes>
            <Route path="/" element={<SourcesSelection />} />
            <Route path="/:sourceId/*" element={<FileExplorer />} />
        </Routes>
    );
}
