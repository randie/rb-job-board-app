import { DataStore } from 'notarealdb';

const store = new DataStore('./data');

export const companies = store.collection('companies');
export const jobs = store.collection('jobs');
export const users = store.collection('users');
