package org.opensearchmetrics.model.maintainer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;

@Data
public class EventData {
    private String eventAction;
    private Instant timeLastEngaged;
    private boolean inactive;
}
