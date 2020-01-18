import { companies, jobs } from './db';

const Query = {
  company: (root, { id }) => companies.get(id),
  job: (root, { id }) => jobs.get(id),
  jobs: () => jobs.list(),
};

const Job = {
  company: job => companies.get(job.companyId), // where job is the parent node in the graph
};

export default { Query, Job };
