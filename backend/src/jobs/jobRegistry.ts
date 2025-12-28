import { BaseJob } from './baseJob';
import { ScanJob } from './processors/scanJob';
import { MetadataJob } from './processors/metadataJob';
import { ThumbsJob } from './processors/thumbsJob';
import { PreviewJob } from './processors/previewJob';
import { JobType } from '../config/jobsConfig';

export const JOB_REGISTRY: Partial<Record<JobType, new () => BaseJob>> = {
    scan: ScanJob,
    metadata: MetadataJob,
    thumbs: ThumbsJob,
    preview: PreviewJob,
};

export function getJobProcessor(type: JobType): BaseJob | null {
    const JobClass = JOB_REGISTRY[type];
    return JobClass ? new JobClass() : null;
}
