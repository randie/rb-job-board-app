const endpointUrl = 'http://localhost:9000/graphql';

async function graphqlRequest(query, variables = {}) {
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  };
  const response = await fetch(endpointUrl, options);
  const responseBody = await response.json();
  if (responseBody.errors) {
    const message = responseBody.errors.map(error => error.message).join('\n');
    throw new Error(message);
  }
  return responseBody.data;
}

export async function fetchJobs() {
  const query = `
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
  const { jobs } = await graphqlRequest(query);
  return jobs;
}

export async function fetchJob(id) {
  const query = `
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
  const { job } = await graphqlRequest(query, { id });
  return job;
}
