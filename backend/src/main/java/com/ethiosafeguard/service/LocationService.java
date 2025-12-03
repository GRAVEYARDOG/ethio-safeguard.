package com.ethiosafeguard.service;

import com.ethiosafeguard.model.LocationData;
import com.ethiosafeguard.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LocationService {
    
    @Autowired
    private LocationRepository locationRepository;
    
    public LocationData saveLocation(LocationData location) {
        if (location.getTimestamp() == null) {
            location.setTimestamp(LocalDateTime.now());
        }
        location.setServerReceivedAt(LocalDateTime.now());
        
        return locationRepository.save(location);
    }
    
    public List<LocationData> getRecentLocations(String truckId, int limit) {
        return locationRepository.findByTruckIdOrderByTimestampDesc(truckId)
                .stream()
                .limit(limit)
                .toList();
    }
    
    public List<String> getActiveTrucks() {
        LocalDateTime since = LocalDateTime.now().minusMinutes(5);
        return locationRepository.findActiveTrucks(since);
    }
}