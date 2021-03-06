import { companies, jobs } from './db';

const Query = {
  company: (root, { id }) => companies.get(id),
  job: (root, { id }) => jobs.get(id),
  jobs: () => jobs.list(),
};

const Mutation = {
  createJob: (root, { input }, { user }) => {
    if (!user) {
      // user is not logged in
      throw new Error('Unauthorized');
    }
    const id = jobs.create({ ...input, companyId: user.companyId });
    return jobs.get(id);
  },
};

const Company = {
  jobs: company => jobs.list().filter(job => job.companyId === company.id), // where company is the parent node in the graph
};

const Job = {
  company: job => companies.get(job.companyId), // where job is the parent node in the graph
};

export default { Query, Mutation, Company, Job };
