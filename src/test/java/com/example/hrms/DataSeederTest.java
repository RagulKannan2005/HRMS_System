package com.example.hrms;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.hrms.config.DataSeeder;

@SpringBootTest
public class DataSeederTest {

    @Autowired
    private DataSeeder dataSeeder;

    @Test
    void runSeeder() throws Exception {
        dataSeeder.run();
    }
}
