@echo off
echo Execution des tests Orthanc...
call gradlew test --tests com.example.demo.orthanc.service.OrthancServiceTest
echo Tests termines.
pause 