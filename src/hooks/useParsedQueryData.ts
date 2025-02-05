import { useMemo } from "react";
import { useAppSelector } from "redux/store";
import { useQueryGetIDTableEntitiesFromQuery } from "utils/knowledgeBase/getEntityData";
import { parseSparqlQuery } from "utils/parseSparqlQuery";
import { transformTripleQueryToGraphin } from "utils/transformTripleDataToGraphin";

export function useParsedQueryData() {
  const queryValue = useAppSelector(state => state.queryValue.queryValue)
  
  const {data: idTableEntities} = useQueryGetIDTableEntitiesFromQuery(queryValue);

  return useMemo(() => {
    const semanticTriples = parseSparqlQuery(queryValue);

    return transformTripleQueryToGraphin(semanticTriples, idTableEntities||undefined);
  }, [queryValue, idTableEntities]);
}