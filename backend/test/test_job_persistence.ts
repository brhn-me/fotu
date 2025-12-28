import prisma from '../src/db/client';
// import { jobService } from '../src/services/jobService'; // Removed
import { ScanJob } from '../src/jobs/scanJob';
// Mock BaseJob progress reporting if needed, or rely on worker events if running fully integrated.
// For this test, we will stimulate the flow manually but check DB.

async function main() {
    console.log('Test disabled: jobService has been removed.');
    /*
    console.log('Clearing old JobRuns...');
    await prisma.jobRun.deleteMany({});

    console.log('Adding a test job via JobService...');
    const jobRun = await jobService.addJob('scan', 'Test Scan', { sourceId: 'test-source', sourcePath: '/tmp' });
    console.log('Job created:', jobRun.id, jobRun.status);

    if (jobRun.status !== 'queued') {
        throw new Error('Initial status should be queued');
    }

    console.log('Simulating worker processing...');
    // We can't easily spin up the actual worker here without complex setup, 
    // but we can verify that jobService.updateStatus works as expected.

    await jobService.updateStatus(jobRun.id, 'running');
    const running = await prisma.jobRun.findUnique({ where: { id: jobRun.id } });
    console.log('Job running:', running?.status, running?.startedAt);

    if (running?.status !== 'running' || !running?.startedAt) {
        throw new Error('Failed to update status to running');
    }

    await jobService.updateStatus(jobRun.id, 'completed', { success: true });
    const completed = await prisma.jobRun.findUnique({ where: { id: jobRun.id } });
    console.log('Job completed:', completed?.status, completed?.completedAt);

    if (completed?.status !== 'completed' || !completed?.completedAt) {
        throw new Error('Failed to update status to completed');
    }

    console.log('Verification successful: Job persistence logic works.');
    */
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
