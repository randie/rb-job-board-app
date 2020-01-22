import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';
import { getAccessToken, isLoggedIn } from './auth';

const endpointUrl = 'http://localhost:9000/graphql';

const httpLink = new HttpLink({ uri: endpointUrl });
const authLink = new ApolloLink((operation, forward) => {
  if (isLoggedIn()) {
    operation.setContext({
      headers: { authorization: `Bearer ${getAccessToken()}` },
    });
  }
  return forward(operation);
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    title
    company {
      id
      name
    }
    description
  }
`;

const jobsQuery = gql`
  query JobsQuery {
    jobs {
      id
      title
      company {
        id
        name
      }
    }
  }
`;

const jobQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

const companyQuery = gql`
  query CompanyQuery($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        title
      }
    }
  }
`;

const createJobMutation = gql`
  mutation CreateJobMutation($input: CreateJobInput) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export async function fetchJobs() {
  const { data } = await client.query({ query: jobsQuery, fetchPolicy: 'no-cache' });
  return data.jobs;
}

export async function fetchJob(id) {
  const { data } = await client.query({ query: jobQuery, variables: { id } });
  return data.job;
}

export async function fetchCompany(id) {
  const { data } = await client.query({
    query: companyQuery,
    variables: { id },
    fetchPolicy: 'no-cache',
  });
  return data.company;
}

export async function createJob(input) {
  const { data } = await client.mutate({
    mutation: createJobMutation,
    variables: { input },
    update: (cache, { data }) => {
      // Creating a job results in 2 graphql request round-trips to the server,
      // the first for the mutation itself and the second to fetch the newly
      // created job. But the mutation already returns the newly created job so
      // the second round-trip is not necessary. To avoid that second round-trip
      // write the result of this mutation to cache, so the second graphql query
      // will retrieve the newly created job from cache instead of making
      // another round-trip to the server.
      cache.writeQuery({ query: jobQuery, variables: { id: data.job.id }, data });
    },
  });
  return data.job;
}
