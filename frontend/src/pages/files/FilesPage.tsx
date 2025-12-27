import { Folder, FileText, Image, Film, ChevronRight } from "lucide-react";
import styles from "./FilesPage.module.css";

interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'image' | 'video' | 'other';
    size: string;
    modified: string;
}

const DUMMY_FILES: FileItem[] = [
    { id: '1', name: 'Vacation 2023', type: 'folder', size: '--', modified: '2023-12-15' },
    { id: '2', name: 'Family Portraits', type: 'folder', size: '--', modified: '2023-11-20' },
    { id: '3', name: 'IMG_4582.jpg', type: 'image', size: '4.2 MB', modified: '2023-12-20' },
    { id: '4', name: 'IMG_4583.jpg', type: 'image', size: '3.8 MB', modified: '2023-12-20' },
    { id: '5', name: 'Summer_Video.mp4', type: 'video', size: '124 MB', modified: '2023-12-18' },
    { id: '6', name: 'readme.txt', type: 'other', size: '12 KB', modified: '2023-12-05' },
    { id: '7', name: 'Weddings', type: 'folder', size: '--', modified: '2023-10-10' },
    { id: '8', name: 'Birthday_Party.mov', type: 'video', size: '85 MB', modified: '2023-11-02' },
];

const FileIcon = ({ type }: { type: FileItem['type'] }) => {
    switch (type) {
        case 'folder': return <Folder className={styles.folderIcon} size={20} />;
        case 'image': return <Image size={20} />;
        case 'video': return <Film size={20} />;
        default: return <FileText size={20} />;
    }
};

export function FilesPage() {
    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.pageTitle}>Files</h1>

            <div className={styles.breadcrumb}>
                <span className={styles.breadcrumbItem}>All Files</span>
                <ChevronRight className={styles.breadcrumbSeparator} size={14} />
                <span className={styles.breadcrumbItem}>Pictures</span>
            </div>

            <div className={styles.explorerContainer}>
                <div className={styles.headerRow}>
                    <div></div>
                    <div>Name</div>
                    <div>Size</div>
                    <div>Last Modified</div>
                </div>

                {DUMMY_FILES.map(file => (
                    <div key={file.id} className={styles.fileRow}>
                        <div className={styles.iconWrapper}>
                            <FileIcon type={file.type} />
                        </div>
                        <div className={styles.fileName}>{file.name}</div>
                        <div className={styles.fileSize}>{file.size}</div>
                        <div className={styles.fileDate}>{file.modified}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
