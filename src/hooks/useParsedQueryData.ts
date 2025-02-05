import { useMemo } from "react";

import { useQueryGetIDTableEntitiesFromQuery } from "utils/knowledgeBase/getEntityData";
import { parseSparqlQuery } from "utils/parseSparqlQuery";
import { transformTripleQueryToGraphin } from "utils/transformTripleDataToGraphin";

export function useParsedQueryData(queryValue:string) {  
  const {data: idTableEntities} = useQueryGetIDTableEntitiesFromQuery(queryValue);

  return useMemo(() => {
    const semanticTriples = parseSparqlQuery(queryValue);

    return transformTripleQueryToGraphin(semanticTriples, idTableEntities||undefined);
  }, [queryValue, idTableEntities]);
}