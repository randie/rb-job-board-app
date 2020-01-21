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

const jobQuery = gql`
  query JobQuery($id: ID!) {
    job(id: $id) {
      id
      title
      company {
        id
        name
      }
      description
    }
  }
`;

export async function fetchJobs() {
  const query = gql`
    {
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
  const { data } = await client.query({ query, fetchPolicy: 'no-cache' });
  return data.jobs;
}

export async function fetchJob(id) {
  const { data } = await client.query({ query: jobQuery, variables: { id } });
  return data.job;
}

export async function fetchCompany(id) {
  const query = gql`
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
  const { data } = await client.query({ query, variables: { id }, fetchPolicy: 'no-cache' });
  return data.company;
}

export async function createJob(input) {
  const mutation = gql`
    mutation CreateJobMutation($input: CreateJobInput) {
      job: createJob(input: $input) {
        id
        title
        company {
          id
          name
        }
        description
      }
    }
  `;
  const { data } = await client.mutate({
    mutation,
    variables: { input },
    update: (cache, { data }) => {
      cache.writeQuery({ query: jobQuery, variables: { id: data.job.id }, data });
    },
  });
  return data.job;
}
