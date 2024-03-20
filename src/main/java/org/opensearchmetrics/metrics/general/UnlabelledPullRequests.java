package org.opensearchmetrics.metrics.general;

import org.opensearch.index.query.BoolQueryBuilder;
import org.opensearch.index.query.QueryBuilders;

import javax.inject.Inject;

public class UnlabelledPullRequests implements Metrics {


    @Inject
    public UnlabelledPullRequests() {}

    @Override
    public String toString() {
        return "Unlabelled Pull Requests";
    }

    @Override
    public BoolQueryBuilder getBoolQueryBuilder(String repo) {
        BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
        boolQueryBuilder.must(QueryBuilders.matchQuery("repository.keyword", repo));
        boolQueryBuilder.must(QueryBuilders.boolQuery().mustNot(QueryBuilders.existsQuery("pull_labels.keyword")));
        boolQueryBuilder.must(QueryBuilders.matchQuery("state.keyword", "open"));
        return boolQueryBuilder;
    }

    @Override
    public String searchIndex() {
        return "github_pulls";
    }
}
