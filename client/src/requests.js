const endpointUrl = 'http://localhost:9000/graphql';

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
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  };
  const response = await fetch(endpointUrl, options);
  const responseBody = await response.json();
  return responseBody.data.jobs;
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
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { id } }),
  };
  const response = await fetch(endpointUrl, options);
  const responseBody = await response.json();
  return responseBody.data.job;
}
