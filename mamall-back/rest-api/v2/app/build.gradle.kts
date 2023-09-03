plugins {
    application
}

repositories {
    mavenCentral()
}

dependencies {
    compileOnly("org.projectlombok:lombok:1.18.28")

    testImplementation("org.junit.jupiter:junit-jupiter:5.9.2")

    implementation("org.springframework:spring-webmvc:6.0.11")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("org.apache.tomcat.embed:tomcat-embed-core:10.1.13")

    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(20))
    }
}

application {
    mainClass.set("mamall.api.v2.Main")
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
