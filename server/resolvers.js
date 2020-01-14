import { jobs } from './db';

const Query = {
  jobs: () => jobs.list(),
};

export default { Query };
