import { TermData, Profile } from '@/types';
import { transformToSlug } from '@/utils/filters';
import { store } from '@/store';
import { setTerms, setLoading, setError } from '@/store/termsSlice';
import fs from 'fs';
import path from 'path';

let terms: TermData[] = [];
const fetchTermsData = async (): Promise<TermData[]> => {
  store.dispatch(setLoading(true));
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'terms.json');
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      terms = JSON.parse(fileContent);
      if(!terms.length) console.log('데이터가 존재하지 않음');
      store.dispatch(setTerms(terms));
      store.dispatch(setLoading(false));

      return terms;
    }

    // 파일이 존재하지 않는 경우 빈 배열 반환
    store.dispatch(setLoading(false));
    return [];
  } catch (error) {
    console.error(error);
    store.dispatch(setLoading(false));
    store.dispatch(setError('데이터 로드 실패'));

    return [];
  }
};

const getTermData = async (slug: string): Promise<TermData | undefined> => {
  const termsDataList = await fetchTermsData();
  const term = termsDataList.find((term) =>
    transformToSlug(term.title?.en ?? '') === slug
  );

  return term;
};

const getTermDataByID = async (id: number): Promise<TermData | undefined> => {
  const termsDataList = await fetchTermsData();

  return termsDataList.find((term) => term.id === id);
};

let cachedProfilesData: Profile[] = [];

const fetchProfilesData = async (): Promise<Profile[]> => {
  if (cachedProfilesData.length) {
    return cachedProfilesData;
  }

  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'profiles.json');
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      cachedProfilesData = JSON.parse(fileContent);
      if(!cachedProfilesData.length) console.log('프로필 데이터가 존재하지 않음');

      return cachedProfilesData;
    }

    // 파일이 존재하지 않는 경우 빈 배열 반환
    return [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
};

export { fetchTermsData, getTermData, getTermDataByID, fetchProfilesData };